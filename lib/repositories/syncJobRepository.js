/**
 * Sync Job Repository
 * Tracks synchronization runs, metadata, execution locks, and historical sync logs.
 */

import { BaseRepository } from "./baseRepository.js";
import { COLLECTIONS } from "../firebase/collections.js";
import { logger } from "../logger/index.js";

const memJobs = new Map();
let activeLock = null;

export class SyncJobRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.SYNC_JOBS);
  }

  /**
   * Attempts to acquire an exclusive lock for syncing.
   * Lock automatically expires after 5 minutes to prevent deadlocks.
   */
  async acquireLock(jobId = `job_${Date.now()}`) {
    const now = Date.now();
    const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    if (activeLock && (now - activeLock.timestamp < LOCK_TIMEOUT_MS)) {
      return { acquired: false, activeJobId: activeLock.jobId, message: "A sync job is already in progress." };
    }

    activeLock = { jobId, timestamp: now };

    const jobData = {
      id: jobId,
      status: "syncing",
      startedAt: new Date().toISOString(),
      completedAt: null,
      videosProcessed: 0,
      videosUpdated: 0,
      snapshotsCreated: 0,
      error: null,
    };

    memJobs.set(jobId, jobData);

    try {
      await this.create(jobId, jobData);
    } catch (err) {
      logger.warn(`Firestore unavailable for sync lock, saved in memJobs: ${err.message}`);
    }

    return { acquired: true, jobId, jobData };
  }

  /**
   * Releases the active lock and finalizes sync status.
   */
  async releaseLock(jobId, status = "success", resultData = {}) {
    if (activeLock && activeLock.jobId === jobId) {
      activeLock = null;
    }

    const completedAt = new Date().toISOString();
    const updatePayload = {
      status,
      completedAt,
      lastSuccessfulSyncAt: status === "success" ? completedAt : undefined,
      ...resultData,
    };

    const current = memJobs.get(jobId) || {};
    const updated = { ...current, ...updatePayload };
    memJobs.set(jobId, updated);
    memJobs.set("latest", updated);

    try {
      await this.update(jobId, updatePayload);
      // Also update latest pointer
      await this.create("latest", updated);
    } catch (err) {
      logger.warn(`Firestore unavailable for releaseLock: ${err.message}`);
    }

    return updated;
  }

  /**
   * Returns the most recent sync job status.
   */
  async getLatestSyncJob() {
    try {
      const doc = await this.findById("latest");
      if (doc) return doc;

      const snapshot = await this.getCollection()
        .orderBy("startedAt", "desc")
        .limit(1)
        .get();

      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
    } catch (err) {
      logger.warn(`Firestore unavailable for getLatestSyncJob: ${err.message}`);
    }

    return memJobs.get("latest") || {
      status: "idle",
      startedAt: null,
      completedAt: null,
      lastSuccessfulSyncAt: null,
      videosProcessed: 0,
      videosUpdated: 0,
      snapshotsCreated: 0,
      error: null,
    };
  }
}

export const syncJobRepository = new SyncJobRepository();
