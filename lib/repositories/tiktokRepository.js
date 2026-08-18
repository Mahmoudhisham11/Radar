/**
 * TikTok Repository
 * Manages TikTok profiles, normalized video catalog, and time-series historical metric snapshots.
 * Zero mock data — Stores only real TikTok Sandbox documents.
 */

import { BaseRepository } from "./baseRepository.js";
import { COLLECTIONS } from "../firebase/collections.js";
import { logger } from "../logger/index.js";

const memProfiles = new Map();
const memVideos = new Map();
const memMetrics = [];

export class TikTokRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.TIKTOK_VIDEOS);
  }

  // Profile operations
  async saveProfile(profileData) {
    const id = profileData.id || "primary";
    const payload = {
      ...profileData,
      id,
      updatedAt: new Date().toISOString(),
    };

    memProfiles.set(id, payload);
    try {
      const profileRepo = new BaseRepository(COLLECTIONS.TIKTOK_PROFILES);
      return await profileRepo.create(id, payload);
    } catch (err) {
      logger.warn(`Firestore unavailable for saveProfile, saved in memory: ${err.message}`);
      return payload;
    }
  }

  async getProfile(id = "primary") {
    try {
      const profileRepo = new BaseRepository(COLLECTIONS.TIKTOK_PROFILES);
      const profile = await profileRepo.findById(id);
      if (profile) return profile;
    } catch (err) {
      logger.warn(`Firestore unavailable for getProfile: ${err.message}`);
    }
    return memProfiles.get(id) || null;
  }

  // Video operations & Smart Metric Diff Detection
  async getVideo(videoId) {
    try {
      const doc = await this.findById(videoId);
      if (doc) return doc;
    } catch (err) {
      logger.warn(`Firestore unavailable for getVideo(${videoId}): ${err.message}`);
    }
    return memVideos.get(videoId) || null;
  }

  /**
   * Upserts a video and detects whether metrics changed compared to the previous stored version.
   * This is used by the Sync Engine to prevent redundant snapshot creation.
   */
  async upsertVideoWithMetricDiff(videoData) {
    const existing = await this.getVideo(videoData.id);
    const now = new Date().toISOString();

    const isNew = !existing;
    let metricsChanged = false;
    let previousMetrics = null;

    if (existing && existing.metrics) {
      previousMetrics = existing.metrics;
      const prev = existing.metrics;
      const curr = videoData.metrics || {};

      metricsChanged =
        (curr.views !== undefined && curr.views !== prev.views) ||
        (curr.likes !== undefined && curr.likes !== prev.likes) ||
        (curr.comments !== undefined && curr.comments !== prev.comments) ||
        (curr.shares !== undefined && curr.shares !== prev.shares);
    } else {
      metricsChanged = Boolean(videoData.metrics);
    }

    const payload = {
      ...existing,
      ...videoData,
      id: videoData.id,
      firstSeenAt: existing?.firstSeenAt || now,
      lastSeenAt: now,
      updatedAt: now,
      metricsUpdatedAt: metricsChanged ? now : (existing?.metricsUpdatedAt || now),
    };

    memVideos.set(videoData.id, payload);

    try {
      await this.create(videoData.id, payload);
    } catch (err) {
      logger.warn(`Firestore unavailable for upsertVideo, updated in memory: ${err.message}`);
    }

    return {
      isNew,
      metricsChanged,
      previousMetrics,
      video: payload,
    };
  }

  async saveVideosBatch(videos) {
    const timestamp = new Date().toISOString();
    for (const video of videos) {
      memVideos.set(video.id, { ...video, updatedAt: timestamp });
    }

    try {
      const db = this.getDb();
      const batch = db.batch();
      const collection = this.getCollection();

      for (const video of videos) {
        const docRef = collection.doc(video.id);
        batch.set(docRef, { ...video, updatedAt: timestamp }, { merge: true });
      }

      await batch.commit();
      logger.info("Batch saved TikTok videos", { count: videos.length });
    } catch (err) {
      logger.warn(`Firestore unavailable for saveVideosBatch: ${err.message}`);
    }
    return { count: videos.length };
  }

  async listVideos(limit = 100) {
    try {
      const snapshot = await this.getCollection()
        .orderBy("publishTime", "desc")
        .limit(limit)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      try {
        return await this.list(limit);
      } catch (err) {
        logger.warn(`Firestore unavailable for listVideos, returning memVideos: ${err.message}`);
        return Array.from(memVideos.values())
          .sort((a, b) => new Date(b.publishTime || 0) - new Date(a.publishTime || 0))
          .slice(0, limit);
      }
    }
  }

  // Immutable Historical Metric Snapshots
  async saveMetricSnapshot(videoId, metrics) {
    const snapshotId = `${videoId}_${Date.now()}`;
    const data = {
      id: snapshotId,
      videoId,
      capturedAt: new Date().toISOString(),
      views: metrics.views ?? 0,
      likes: metrics.likes ?? 0,
      comments: metrics.comments ?? 0,
      shares: metrics.shares ?? 0,
      engagementRate: metrics.engagementRate ?? 0,
    };
    memMetrics.push(data);

    try {
      const metricsRepo = new BaseRepository(COLLECTIONS.TIKTOK_VIDEO_METRICS);
      await metricsRepo.create(snapshotId, data);
    } catch (err) {
      logger.warn(`Firestore unavailable for saveMetricSnapshot: ${err.message}`);
    }
    return data;
  }

  async getMetricHistory(videoId, limit = 100) {
    try {
      const db = this.getDb();
      const snapshot = await db
        .collection(COLLECTIONS.TIKTOK_VIDEO_METRICS)
        .where("videoId", "==", videoId)
        .orderBy("capturedAt", "asc")
        .limit(limit)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.warn(`Firestore unavailable for getMetricHistory: ${error.message}`);
      return memMetrics.filter((m) => m.videoId === videoId).slice(0, limit);
    }
  }
}

export const tiktokRepository = new TikTokRepository();
