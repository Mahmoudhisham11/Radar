/**
 * Goal, Insight, Attention, and Sync Repositories
 */

import { BaseRepository } from "./baseRepository";
import { COLLECTIONS } from "@/lib/firebase/collections";

export class GoalRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.GOALS);
  }

  async getActiveGoals() {
    try {
      const snapshot = await this.getCollection().where("isActive", "==", true).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      return this.list(20);
    }
  }
}

export class InsightRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.INSIGHTS);
  }

  async getRecentInsights(limit = 20) {
    try {
      const snapshot = await this.getCollection().orderBy("createdAt", "desc").limit(limit).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      return this.list(limit);
    }
  }
}

export class AttentionRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.ATTENTION_ITEMS);
  }

  async getUnresolvedItems() {
    try {
      const snapshot = await this.getCollection().where("isResolved", "==", false).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      return this.list(20);
    }
  }
}

export class SyncRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.SYNC_JOBS);
  }

  async recordSync(jobName, status, details = {}) {
    return this.create(null, {
      jobName,
      status,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  async getLatestSync(jobName = "tiktok_full_sync") {
    try {
      const snapshot = await this.getCollection()
        .where("jobName", "==", jobName)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch {
      return null;
    }
  }
}

export const goalRepository = new GoalRepository();
export const insightRepository = new InsightRepository();
export const attentionRepository = new AttentionRepository();
export const syncRepository = new SyncRepository();
