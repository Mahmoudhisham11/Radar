/**
 * TikTok Sandbox API Layer
 * Specifically isolated for Sandbox-compatible endpoints.
 */

import { TikTokClient } from "../client/tiktokClient";
import { TIKTOK_ENDPOINTS } from "../schemas/tiktokSchemas";
import { transformTikTokProfile, transformTikTokVideo } from "../transformers/tiktokTransformers";
import { logger } from "@/lib/logger";

export class TikTokSandboxApi {
  constructor(accessToken) {
    this.client = new TikTokClient(accessToken);
  }

  async fetchUserProfile() {
    try {
      const response = await this.client.request(
        `${TIKTOK_ENDPOINTS.USER_INFO}?fields=open_id,union_id,avatar_url,display_name,bio_description,is_verified,follower_count,following_count,likes_count,video_count`,
        { method: "GET" }
      );
      return transformTikTokProfile(response.data?.user || response.data);
    } catch (error) {
      logger.error("Failed to fetch TikTok Sandbox user profile", error);
      throw error;
    }
  }

  async fetchVideoList(maxCount = 20, cursor = 0) {
    try {
      const response = await this.client.request(TIKTOK_ENDPOINTS.VIDEO_LIST, {
        method: "POST",
        body: JSON.stringify({
          max_count: maxCount,
          cursor,
          fields: ["id", "title", "create_time", "cover_image_url", "share_url", "duration", "view_count", "like_count", "comment_count", "share_count"]
        })
      });
      const rawVideos = response.data?.videos || [];
      return {
        videos: rawVideos.map(transformTikTokVideo),
        hasMore: Boolean(response.data?.has_more),
        cursor: response.data?.cursor || 0,
      };
    } catch (error) {
      logger.error("Failed to fetch TikTok Sandbox video list", error);
      throw error;
    }
  }
}
