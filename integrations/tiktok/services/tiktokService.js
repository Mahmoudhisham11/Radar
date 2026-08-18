/**
 * TikTok Integration Service
 * Central domain entrypoint for all TikTok operations in RADAR.
 * Internal services and API routes should use this service rather than raw API calls.
 */

import { tiktokAuth } from "../auth/tiktokAuth";
import { TikTokSandboxApi } from "../api/sandboxApi";
import { tiktokRepository } from "@/lib/repositories/tiktokRepository";
import { connectionRepository } from "@/lib/repositories/connectionRepository";
import { CONNECTION_STATUS } from "@/lib/firebase/collections";
import { logger } from "@/lib/logger";

export class TikTokService {
  /**
   * Get public connection status (safe for React UI)
   */
  async getConnectionStatus() {
    return tiktokAuth.getConnectionStatus();
  }

  /**
   * Generates authorization URL
   */
  getAuthorizationUrl(state) {
    return tiktokAuth.getAuthorizationUrl(state);
  }

  /**
   * Handles OAuth callback: exchanges code, fetches profile, saves in Firestore
   */
  async handleOAuthCallback(code) {
    const timer = logger.startTimer("TikTokService.handleOAuthCallback");

    // 1. Exchange code for access & refresh tokens
    const tokenData = await tiktokAuth.exchangeCodeForToken(code);

    // 2. Fetch initial profile from Sandbox using access token
    try {
      const sandboxApi = new TikTokSandboxApi(tokenData.accessToken);
      const profile = await sandboxApi.fetchUserProfile();

      if (profile) {
        // Save profile in Firestore
        await tiktokRepository.saveProfile(profile);

        // Update connection document with display metadata
        await connectionRepository.saveIntegration("tiktok", {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          openId: profile.id,
          status: CONNECTION_STATUS.CONNECTED,
          lastSyncedAt: new Date().toISOString(),
        });
      }
    } catch (profileError) {
      logger.warn("Initial profile fetch after OAuth failed (continuing with connection)", profileError);
    }

    timer.end("success");
    return { success: true, status: CONNECTION_STATUS.CONNECTED };
  }

  /**
   * Refreshes the token and updates the connection
   */
  async refreshConnection() {
    const token = await tiktokAuth.refreshAccessToken();
    return { success: Boolean(token), status: CONNECTION_STATUS.CONNECTED };
  }

  /**
   * Disconnects TikTok and clears credentials
   */
  async disconnect() {
    return tiktokAuth.disconnect();
  }

  /**
   * Fetches latest profile (from API with cache fallback in repository)
   */
  async getProfile() {
    const accessToken = await tiktokAuth.getValidAccessToken();
    if (!accessToken) {
      // Return cached profile if available
      return tiktokRepository.getProfile("primary");
    }

    try {
      const sandboxApi = new TikTokSandboxApi(accessToken);
      const profile = await sandboxApi.fetchUserProfile();
      if (profile) {
        await tiktokRepository.saveProfile(profile);
        return profile;
      }
    } catch (err) {
      logger.warn("Live profile fetch failed, returning cached profile", err);
    }

    return tiktokRepository.getProfile("primary");
  }

  /**
   * Fetches videos from TikTok Sandbox API and updates repository
   */
  async getVideos(maxCount = 20, cursor = 0) {
    const accessToken = await tiktokAuth.getValidAccessToken();
    if (!accessToken) {
      const cached = await tiktokRepository.listVideos(maxCount);
      return { videos: cached, hasMore: false, cursor: 0, fromCache: true };
    }

    try {
      const sandboxApi = new TikTokSandboxApi(accessToken);
      const result = await sandboxApi.fetchVideoList(maxCount, cursor);

      if (result.videos && result.videos.length > 0) {
        await tiktokRepository.saveVideosBatch(result.videos);
      }

      return result;
    } catch (err) {
      logger.warn("Live video fetch failed, returning cached videos", err);
      const cached = await tiktokRepository.listVideos(maxCount);
      return { videos: cached, hasMore: false, cursor: 0, fromCache: true, error: err.message };
    }
  }
}

export const tiktokService = new TikTokService();
