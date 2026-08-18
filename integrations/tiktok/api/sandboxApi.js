/**
 * TikTok Sandbox API Layer
 * Specifically isolated for Sandbox-compatible endpoints.
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
   * Fetches user videos from official TikTok v2 API
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
      logger.error("Failed to fetch TikTok Sandbox video list", error);
      throw error;
    }
  }
}
