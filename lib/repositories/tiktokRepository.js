/**
 * TikTok Repository
 * Manages TikTok profiles, video catalog, and time-series historical metric snapshots.
 */

import { BaseRepository } from "./baseRepository";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { logger } from "@/lib/logger";

export class TikTokRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.TIKTOK_VIDEOS);
  }

  // Profile operations
  async saveProfile(profileData) {
    const profileRepo = new BaseRepository(COLLECTIONS.TIKTOK_PROFILES);
    return profileRepo.create(profileData.id || "primary", profileData);
  }

  async getProfile(id = "primary") {
    const profileRepo = new BaseRepository(COLLECTIONS.TIKTOK_PROFILES);
    return profileRepo.findById(id);
  }

  // Video catalog operations
  async saveVideo(videoData) {
    return this.create(videoData.id, videoData);
  }

  async saveVideosBatch(videos) {
    const db = this.getDb();
    const batch = db.batch();
    const collection = this.getCollection();
    const timestamp = new Date().toISOString();

    for (const video of videos) {
      const docRef = collection.doc(video.id);
      batch.set(docRef, { ...video, updatedAt: timestamp }, { merge: true });
    }

    await batch.commit();
    logger.info("Batch saved TikTok videos", { count: videos.length });
    return { count: videos.length };
  }

  async listVideos(limit = 50) {
    try {
      const snapshot = await this.getCollection()
        .orderBy("publishTime", "desc")
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      // Fallback if index on publishTime is pending
      return this.list(limit);
    }
  }

  // Historical Metric Snapshots
  async saveMetricSnapshot(videoId, metrics) {
    const metricsRepo = new BaseRepository(COLLECTIONS.TIKTOK_VIDEO_METRICS);
    const snapshotId = `${videoId}_${Date.now()}`;
    return metricsRepo.create(snapshotId, {
      videoId,
      timestamp: new Date().toISOString(),
      views: metrics.views || 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      reach: metrics.reach || 0,
      engagementRate: metrics.engagementRate || 0,
    });
  }

  async getMetricHistory(videoId, limit = 100) {
    try {
      const db = this.getDb();
      const snapshot = await db.collection(COLLECTIONS.TIKTOK_VIDEO_METRICS)
        .where("videoId", "==", videoId)
        .orderBy("timestamp", "asc")
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error("Error fetching metric history", error, { videoId });
      return [];
    }
  }
}

export const tiktokRepository = new TikTokRepository();
