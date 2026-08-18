/**
 * TikTok Repository
 * Manages TikTok profiles, video catalog, and time-series historical metric snapshots.
 */

import { BaseRepository } from "./baseRepository";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { logger } from "@/lib/logger";

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
    memProfiles.set(id, { id, ...profileData, updatedAt: new Date().toISOString() });
    try {
      const profileRepo = new BaseRepository(COLLECTIONS.TIKTOK_PROFILES);
      return await profileRepo.create(id, profileData);
    } catch (err) {
      logger.warn(`Firestore unavailable for saveProfile, saved in memory: ${err.message}`);
      return memProfiles.get(id);
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

  // Video catalog operations
  async saveVideo(videoData) {
    memVideos.set(videoData.id, { ...videoData, updatedAt: new Date().toISOString() });
    try {
      return await this.create(videoData.id, videoData);
    } catch (err) {
      logger.warn(`Firestore unavailable for saveVideo: ${err.message}`);
      return memVideos.get(videoData.id);
    }
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

  async listVideos(limit = 50) {
    try {
      const snapshot = await this.getCollection()
        .orderBy("publishTime", "desc")
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      try {
        return await this.list(limit);
      } catch (err) {
        logger.warn(`Firestore unavailable for listVideos, returning memVideos: ${err.message}`);
        return Array.from(memVideos.values()).slice(0, limit);
      }
    }
  }

  // Historical Metric Snapshots
  async saveMetricSnapshot(videoId, metrics) {
    const snapshotId = `${videoId}_${Date.now()}`;
    const data = {
      id: snapshotId,
      videoId,
      timestamp: new Date().toISOString(),
      views: metrics.views || 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      reach: metrics.reach || 0,
      engagementRate: metrics.engagementRate || 0,
    };
    memMetrics.push(data);

    try {
      const metricsRepo = new BaseRepository(COLLECTIONS.TIKTOK_VIDEO_METRICS);
      return await metricsRepo.create(snapshotId, data);
    } catch (err) {
      logger.warn(`Firestore unavailable for saveMetricSnapshot: ${err.message}`);
      return data;
    }
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
      logger.warn(`Firestore unavailable for getMetricHistory: ${error.message}`);
      return memMetrics.filter(m => m.videoId === videoId).slice(0, limit);
    }
  }
}

export const tiktokRepository = new TikTokRepository();
