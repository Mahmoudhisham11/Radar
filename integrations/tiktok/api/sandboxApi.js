/**
 * TikTok Sandbox API Layer
 * Isolated for Sandbox-compatible endpoints with full pagination support.
 */

import { TikTokClient } from "../client/tiktokClient";
import { TIKTOK_ENDPOINTS } from "../schemas/tiktokSchemas";
import { transformTikTokProfile, transformTikTokVideo } from "../transformers/tiktokTransformers";
import { logger } from "@/lib/logger";

const USER_FIELDS = [
  "open_id",
  "union_id",
  "avatar_url",
  "avatar_large_url",
  "display_name",
  "bio_description",
  "profile_deep_link",
  "is_verified",
  "follower_count",
  "following_count",
  "likes_count",
  "video_count",
].join(",");

const VIDEO_FIELDS = [
  "id",
  "title",
  "create_time",
  "cover_image_url",
  "share_url",
  "duration",
  "view_count",
  "like_count",
  "comment_count",
  "share_count",
].join(",");

export class TikTokSandboxApi {
  constructor(accessToken) {
    if (!accessToken) {
      throw new Error("TikTokSandboxApi requires a valid accessToken.");
    }
    this.client = new TikTokClient(accessToken);
  }

  /**
   * Fetches user profile from official TikTok v2 API
   */
  async fetchUserProfile() {
    try {
      const url = `${TIKTOK_ENDPOINTS.USER_INFO}?fields=${USER_FIELDS}`;
      const response = await this.client.request(url, { method: "GET" });
      const rawUser = response.data?.user || response.data || null;
      return transformTikTokProfile(rawUser);
    } catch (error) {
      logger.error("Failed to fetch TikTok Sandbox user profile", error);
      throw error;
    }
  }

  /**
   * Fetches a single page of videos from official TikTok v2 API
   */
  async fetchVideoList(maxCount = 20, cursor = 0) {
    try {
      const url = `${TIKTOK_ENDPOINTS.VIDEO_LIST}?fields=${VIDEO_FIELDS}`;
      const body = { max_count: Math.min(maxCount, 20) };
      if (cursor) {
        body.cursor = cursor;
      }

      const response = await this.client.request(url, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const rawVideos = response.data?.videos || [];
      return {
        videos: rawVideos.map(transformTikTokVideo).filter(Boolean),
        hasMore: Boolean(response.data?.has_more),
        cursor: response.data?.cursor || 0,
      };
    } catch (error) {
      logger.error("Failed to fetch TikTok Sandbox video list page", error);
      throw error;
    }
  }

  /**
   * Paginates through all available videos until has_more is false
   */
  async fetchAllVideos(maxPages = 10) {
    const allVideos = [];
    let currentCursor = 0;
    let pageCount = 0;
    let hasMore = true;

    while (hasMore && pageCount < maxPages) {
      pageCount++;
      const pageResult = await this.fetchVideoList(20, currentCursor);
      
      if (pageResult.videos && pageResult.videos.length > 0) {
        allVideos.push(...pageResult.videos);
      }

      hasMore = pageResult.hasMore;
      currentCursor = pageResult.cursor;

      if (!hasMore || !currentCursor) break;
    }

    // Deduplicate by ID just in case pagination overlaps
    const seen = new Set();
    const uniqueVideos = [];
    for (const v of allVideos) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        uniqueVideos.push(v);
      }
    }

    return uniqueVideos;
  }
}
