/**
 * TikTok Data Synchronization Engine
 * Orchestrates fetch -> normalize -> compare -> persist -> snapshot -> realtime event notification.
 */

import { tiktokAuth } from "../auth/tiktokAuth";
import { TikTokSandboxApi } from "../api/sandboxApi";
import { tiktokRepository } from "@/lib/repositories/tiktokRepository";
import { syncRepository } from "@/lib/repositories/goalRepository";
import { logger } from "@/lib/logger";

export class TikTokSyncEngine {
  async runFullSync() {
    const timer = logger.startTimer("TikTokSyncEngine.runFullSync");
    
    try {
      const accessToken = await tiktokAuth.getValidToken();
      if (!accessToken) {
        throw new Error("No active TikTok connection or valid token found.");
      }

      const api = new TikTokSandboxApi(accessToken);

      // 1. Sync Profile
      const profile = await api.fetchUserProfile();
      if (profile) {
        await tiktokRepository.saveProfile(profile);
      }

      // 2. Sync Videos
      const { videos } = await api.fetchVideoList(30);
      if (videos && videos.length > 0) {
        await tiktokRepository.saveVideosBatch(videos);

        // 3. Record Metric Snapshots for time-series analytics
        for (const video of videos) {
          if (video.metrics) {
            await tiktokRepository.saveMetricSnapshot(video.id, video.metrics);
          }
        }
      }

      const result = {
        profileUpdated: Boolean(profile),
        videosCount: videos.length,
        timestamp: new Date().toISOString(),
      };

      await syncRepository.recordSync("tiktok_full_sync", "success", result);
      timer.end("success", result);
      return result;
    } catch (error) {
      timer.error(error);
      await syncRepository.recordSync("tiktok_full_sync", "failed", { error: error.message });
      throw error;
    }
  }
}

export const tiktokSyncEngine = new TikTokSyncEngine();
