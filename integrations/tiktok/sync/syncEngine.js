/**
 * TikTok Data Synchronization Engine
 * Orchestrates fetch -> normalize -> diff -> persist -> smart snapshotting -> job metadata.
 * REAL DATA ONLY — Enforces concurrency locking and zero mock data.
 */

import { tiktokAuth } from "../auth/tiktokAuth";
import { TikTokSandboxApi } from "../api/sandboxApi";
import { tiktokRepository } from "@/lib/repositories/tiktokRepository";
import { syncJobRepository } from "@/lib/repositories/syncJobRepository";
import { connectionRepository } from "@/lib/repositories/connectionRepository";
import { CONNECTION_STATUS } from "@/lib/firebase/collections";
import { logger } from "@/lib/logger";

export class TikTokSyncEngine {
  /**
   * Syncs user profile from TikTok into Firestore
   */
  async syncTikTokProfile(api) {
    try {
      const profile = await api.fetchUserProfile();
      if (profile) {
        await tiktokRepository.saveProfile(profile);

        // Update public connection info
        await connectionRepository.saveIntegration("tiktok", {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          openId: profile.id,
          status: CONNECTION_STATUS.CONNECTED,
          lastSyncedAt: new Date().toISOString(),
        });
      }
      return profile;
    } catch (err) {
      logger.warn("SyncEngine: Failed to sync profile", err);
      return null;
    }
  }

  /**
   * Syncs all videos and applies smart metric diffs & snapshots
   */
  async syncTikTokVideos(api) {
    const rawVideos = await api.fetchAllVideos();
    let videosUpdated = 0;
    let snapshotsCreated = 0;

    for (const video of rawVideos) {
      const { isNew, metricsChanged } = await tiktokRepository.upsertVideoWithMetricDiff(video);

      if (isNew || metricsChanged) {
        videosUpdated++;

        // Only create a historical snapshot if metrics actually exist and changed
        if (video.metrics && (isNew || metricsChanged)) {
          await tiktokRepository.saveMetricSnapshot(video.id, video.metrics);
          snapshotsCreated++;
        }
      }
    }

    return {
      videosProcessed: rawVideos.length,
      videosUpdated,
      snapshotsCreated,
      videos: rawVideos,
    };
  }

  /**
   * Master full sync orchestrator with concurrency locking
   */
  async syncAllTikTokData(trigger = "manual") {
    const jobId = `sync_${Date.now()}`;
    const timer = logger.startTimer("TikTokSyncEngine.syncAllTikTokData", { trigger, jobId });

    // 1. Acquire execution lock to prevent parallel duplicate jobs
    const lock = await syncJobRepository.acquireLock(jobId);
    if (!lock.acquired) {
      logger.warn("Sync skipped: Another sync job is actively running", { activeJobId: lock.activeJobId });
      return {
        status: "skipped",
        message: lock.message,
        activeJobId: lock.activeJobId,
      };
    }

    try {
      // 2. Validate connection and obtain valid access token
      const accessToken = await tiktokAuth.getValidAccessToken();
      if (!accessToken) {
        throw new Error("No active TikTok connection or valid OAuth token found.");
      }

      const api = new TikTokSandboxApi(accessToken);

      // 3. Sync Profile
      const profile = await this.syncTikTokProfile(api);

      // 4. Sync Videos with Pagination & Smart Snapshotting
      const videoSync = await this.syncTikTokVideos(api);

      const result = {
        trigger,
        profileUpdated: Boolean(profile),
        videosProcessed: videoSync.videosProcessed,
        videosUpdated: videoSync.videosUpdated,
        snapshotsCreated: videoSync.snapshotsCreated,
        completedAt: new Date().toISOString(),
      };

      // 5. Release Lock & Save Job Success
      await syncJobRepository.releaseLock(jobId, "success", result);
      timer.end("success", result);

      return {
        status: "success",
        ...result,
      };
    } catch (error) {
      timer.error(error);
      await syncJobRepository.releaseLock(jobId, "error", {
        error: error.message || "TikTok sync failed",
      });
      throw error;
    }
  }

  /**
   * Returns current sync status and freshness metadata
   */
  async getSyncStatus() {
    return syncJobRepository.getLatestSyncJob();
  }
}

export const tiktokSyncEngine = new TikTokSyncEngine();
