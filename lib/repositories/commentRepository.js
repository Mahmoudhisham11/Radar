/**
 * Comments Repository
 * Manages video comments and tracks replied / unreplied status.
 * REAL DATA ONLY — Zero mock / seeded data.
 */

import { BaseRepository } from "./baseRepository.js";
import { COLLECTIONS } from "../firebase/collections.js";
import { logger } from "../logger/index.js";

const memComments = new Map();

export class CommentRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.COMMENTS);
  }

  async listComments() {
    try {
      const snapshot = await this.list(100);
      if (snapshot && snapshot.length > 0) {
        return snapshot;
      }
    } catch (err) {
      logger.warn(`Firestore unavailable for listComments, using memComments: ${err.message}`);
    }
    return Array.from(memComments.values()).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  async markAsReplied(commentId) {
    const updatePayload = {
      replied: true,
      repliedAt: new Date().toISOString(),
    };

    const current = memComments.get(commentId) || {};
    const updated = { ...current, ...updatePayload };
    memComments.set(commentId, updated);

    try {
      await this.update(commentId, updatePayload);
    } catch (err) {
      logger.warn(`Firestore unavailable for markAsReplied: ${err.message}`);
    }

    return updated;
  }

  async addComment(commentData) {
    const id = commentData.id || `cm_${Date.now()}`;
    const payload = {
      id,
      replied: false,
      repliedAt: null,
      timestamp: new Date().toISOString(),
      ...commentData,
    };
    memComments.set(id, payload);

    try {
      await this.create(id, payload);
    } catch (err) {
      logger.warn(`Firestore unavailable for addComment: ${err.message}`);
    }

    return payload;
  }
}

export const commentRepository = new CommentRepository();
