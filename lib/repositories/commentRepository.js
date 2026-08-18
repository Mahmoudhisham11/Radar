/**
 * Comments Repository
 * Manages video comments and tracks replied / unreplied status.
 */

import { BaseRepository } from "./baseRepository.js";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { logger } from "@/lib/logger";

const memComments = new Map();

// Initial sample / synced comments seeded from video engagement
const initialComments = [
  {
    id: "cm_101",
    videoId: "752493095395634439",
    videoTitle: "اعمل فولو عشان تعرف الجديد #softwareengineer #programming #فودافون_كاش",
    authorName: "Ahmed Salem",
    authorAvatar: "",
    text: "البرنامج دا بيشتغل أوفلاين لو النت قطع في الكاشير؟",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    replied: false,
    repliedAt: null,
  },
  {
    id: "cm_102",
    videoId: "7525366258175413522",
    videoTitle: "مميزات برنامج كاشات #softwareengineer #programming",
    authorName: "Mahmoud Hassan",
    authorAvatar: "",
    text: "بكام الاشتراك الشهري للمطعم ٣ فروع؟",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    replied: false,
    repliedAt: null,
  },
  {
    id: "cm_103",
    videoId: "7540657198904790293",
    videoTitle: "#code#ai #webdevelopment",
    authorName: "Tarek Mostafa",
    authorAvatar: "",
    text: "عاش جدا شرح ممتاز، هل في تجربة مجانية؟",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    replied: false,
    repliedAt: null,
  },
  {
    id: "cm_104",
    videoId: "7524580722259021063",
    videoTitle: "React project #programming #softwareengineer",
    authorName: "Youssef Ali",
    authorAvatar: "",
    text: "ممكن تفاصيل أكتر عن الربط مع الفواتير الإلكترونية؟",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    replied: true,
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  }
];

initialComments.forEach(c => memComments.set(c.id, c));

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
