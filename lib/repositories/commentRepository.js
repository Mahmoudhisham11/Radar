/**
 * Comments Repository
 * Manages video comments, customer inquiries, and tracks replied / unreplied status.
 * Zero mock data — Persistent storage in Firestore with resilient in-memory fallback.
 */

import { BaseRepository } from "./baseRepository.js";
import { COLLECTIONS } from "../firebase/collections.js";
import { logger } from "../logger/index.js";

const memComments = new Map();

export class CommentRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.COMMENTS);
  }

  async listComments(limit = 100) {
    try {
      const snapshot = await this.list(limit);
      if (snapshot && snapshot.length > 0) {
        // Sync to memory
        for (const item of snapshot) {
          memComments.set(item.id, item);
        }
        return snapshot.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
      }
    } catch (err) {
      logger.debug(`Firestore unavailable for listComments, using memComments: ${err.message}`);
    }

    return Array.from(memComments.values()).sort(
      (a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0)
    ).slice(0, limit);
  }

  async getUnrepliedCount() {
    const comments = await this.listComments();
    return comments.filter((c) => !c.replied).length;
  }

  async markAsReplied(commentId) {
    const updatePayload = {
      replied: true,
      repliedAt: new Date().toISOString(),
    };

    const current = memComments.get(commentId) || {};
    const updated = { ...current, ...updatePayload, id: commentId };
    memComments.set(commentId, updated);

    try {
      await this.update(commentId, updatePayload);
    } catch (err) {
      logger.debug(`Firestore unavailable for markAsReplied: ${err.message}`);
    }

    return updated;
  }

  async addComment(commentData) {
    const id = commentData.id || `cm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const timestamp = commentData.timestamp || new Date().toISOString();
    const payload = {
      id,
      text: commentData.text || "",
      authorName: commentData.authorName || "مستخدم تيك توك",
      authorAvatar: commentData.authorAvatar || "",
      videoId: commentData.videoId || null,
      videoTitle: commentData.videoTitle || "فيديو تيك توك",
      replied: Boolean(commentData.replied),
      repliedAt: commentData.replied ? new Date().toISOString() : null,
      timestamp,
      createdAt: timestamp,
    };

    memComments.set(id, payload);

    try {
      await this.create(id, payload);
    } catch (err) {
      logger.debug(`Firestore unavailable for addComment: ${err.message}`);
    }

    return payload;
  }
}

export const commentRepository = new CommentRepository();
