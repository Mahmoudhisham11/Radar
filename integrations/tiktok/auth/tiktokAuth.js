/**
 * TikTok Authentication & OAuth Service
 * Handles authorization URL, token exchange, persistent credentials storage, and token refresh.
 */

import { connectionRepository } from "@/lib/repositories/connectionRepository";
import { CONNECTION_STATUS } from "@/lib/firebase/collections";
import { TIKTOK_ENDPOINTS, TIKTOK_SCOPES } from "../schemas/tiktokSchemas";
import { logger } from "@/lib/logger";

export class TikTokAuthService {
  getClientConfig() {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;
    const isSandbox = process.env.TIKTOK_SANDBOX_MODE === "true";

    return { clientKey, clientSecret, redirectUri, isSandbox };
  }

  getAuthorizationUrl(state = "radar_state_csrf") {
    const { clientKey, redirectUri } = this.getClientConfig();
    if (!clientKey || !redirectUri) {
      throw new Error("TikTok OAuth configuration missing (TIKTOK_CLIENT_KEY or TIKTOK_REDIRECT_URI).");
    }

    const params = new URLSearchParams({
      client_key: clientKey,
      scope: TIKTOK_SCOPES.join(","),
      response_type: "code",
      redirect_uri: redirectUri,
      state,
    });

    return `${TIKTOK_ENDPOINTS.AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    const { clientKey, clientSecret, redirectUri } = this.getClientConfig();
    const timer = logger.startTimer("TikTokAuth.exchangeCodeForToken");

    try {
      const response = await fetch(TIKTOK_ENDPOINTS.TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error_description || data.message || "Failed to exchange TikTok auth code.");
      }

      const tokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        openId: data.open_id,
        expiresIn: data.expires_in,
        refreshExpiresIn: data.refresh_expires_in,
        scope: data.scope,
        tokenType: data.token_type,
        status: CONNECTION_STATUS.CONNECTED,
        connectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (data.expires_in || 86400) * 1000).toISOString(),
      };

      await connectionRepository.saveIntegration("tiktok", tokenData);
      timer.end("success");
      return tokenData;
    } catch (error) {
      timer.error(error);
      await connectionRepository.updateStatus("tiktok", CONNECTION_STATUS.ERROR, error.message);
      throw error;
    }
  }

  async getValidToken() {
    const connection = await connectionRepository.getTikTokConnection();
    if (!connection || !connection.accessToken) {
      return null;
    }

    const expiresAt = new Date(connection.expiresAt).getTime();
    // If expires in less than 5 minutes, refresh
    if (Date.now() > expiresAt - 300000 && connection.refreshToken) {
      return this.refreshToken(connection.refreshToken);
    }

    return connection.accessToken;
  }

  async refreshToken(refreshToken) {
    const { clientKey, clientSecret } = this.getClientConfig();
    const timer = logger.startTimer("TikTokAuth.refreshToken");

    try {
      await connectionRepository.updateStatus("tiktok", CONNECTION_STATUS.REFRESHING);

      const response = await fetch(TIKTOK_ENDPOINTS.TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error_description || "Failed to refresh TikTok access token.");
      }

      const updatedPayload = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in,
        status: CONNECTION_STATUS.CONNECTED,
        expiresAt: new Date(Date.now() + (data.expires_in || 86400) * 1000).toISOString(),
      };

      await connectionRepository.saveIntegration("tiktok", updatedPayload);
      timer.end("success");
      return data.access_token;
    } catch (error) {
      timer.error(error);
      await connectionRepository.updateStatus("tiktok", CONNECTION_STATUS.EXPIRED, error.message);
      throw error;
    }
  }

  async disconnect() {
    return connectionRepository.updateStatus("tiktok", CONNECTION_STATUS.DISCONNECTED);
  }
}

export const tiktokAuth = new TikTokAuthService();
