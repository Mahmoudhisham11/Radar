/**
 * TikTok Authentication & OAuth Service
 * Handles authorization URL generation, token exchange, persistent credential storage,
 * credential lifecycle, automatic refreshing, and disconnection.
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

  /**
   * Generates official TikTok OAuth 2.0 Authorization URL
   */
  getAuthorizationUrl(state = "radar_csrf_" + Date.now()) {
    const { clientKey, redirectUri } = this.getClientConfig();
    if (!clientKey || !redirectUri) {
      throw new Error("TikTok OAuth configuration missing (TIKTOK_CLIENT_KEY or TIKTOK_REDIRECT_URI).");
    }

    const configuredScopes = process.env.TIKTOK_SCOPES
      ? process.env.TIKTOK_SCOPES.split(",").map((s) => s.trim()).filter(Boolean)
      : TIKTOK_SCOPES;

    const params = new URLSearchParams({
      client_key: clientKey,
      scope: configuredScopes.join(","),
      response_type: "code",
      redirect_uri: redirectUri,
      state,
    });

    return `${TIKTOK_ENDPOINTS.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for access and refresh tokens
   */
  async exchangeCodeForToken(code) {
    const { clientKey, clientSecret, redirectUri } = this.getClientConfig();
    const timer = logger.startTimer("TikTokAuth.exchangeCodeForToken");

    if (!clientKey || !clientSecret || !redirectUri) {
      const errorMsg = "TikTok configuration missing: TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, or TIKTOK_REDIRECT_URI.";
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

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

      const raw = await response.json();

      // Check both top-level and v2 nested data envelope
      const tokenPayload = raw.data || raw;
      const errorObj = raw.error || (raw.message ? raw : null);

      if (!response.ok || (errorObj && errorObj.code && errorObj.code !== "ok" && errorObj.code !== 0)) {
        const errorDetail = errorObj?.message || raw.error_description || "TikTok token exchange failed.";
        throw new Error(errorDetail);
      }

      if (!tokenPayload.access_token) {
        throw new Error(raw.error_description || raw.message || "No access token returned from TikTok.");
      }

      const expiresInSeconds = Number(tokenPayload.expires_in) || 86400; // 24 hours default
      const now = Date.now();

      const connectionRecord = {
        accessToken: tokenPayload.access_token,
        refreshToken: tokenPayload.refresh_token || null,
        openId: tokenPayload.open_id || null,
        expiresIn: expiresInSeconds,
        refreshExpiresIn: tokenPayload.refresh_expires_in || 31536000,
        scope: tokenPayload.scope || TIKTOK_SCOPES.join(","),
        tokenType: tokenPayload.token_type || "Bearer",
        status: CONNECTION_STATUS.CONNECTED,
        connectedAt: new Date().toISOString(),
        expiresAt: new Date(now + expiresInSeconds * 1000).toISOString(),
        lastError: null,
      };

      await connectionRepository.saveIntegration("tiktok", connectionRecord);
      timer.end("success");
      return connectionRecord;
    } catch (error) {
      timer.error(error);
      await connectionRepository.updateStatus("tiktok", CONNECTION_STATUS.ERROR, error.message);
      throw error;
    }
  }

  /**
   * Retrieves active connection record from Firestore or Cookie session
   */
  async getConnection(sessionCookie = null) {
    return connectionRepository.getTikTokConnection(sessionCookie);
  }

  /**
   * Returns sanitized public connection status for frontend
   */
  async getConnectionStatus(sessionCookie = null) {
    return connectionRepository.getPublicTikTokStatus(sessionCookie);
  }

  /**
   * Checks whether TikTok is actively connected
   */
  async isConnected(sessionCookie = null) {
    const conn = await this.getConnection(sessionCookie);
    return Boolean(conn && conn.status === CONNECTION_STATUS.CONNECTED && conn.accessToken);
  }

  /**
   * Returns a valid access token. Auto-refreshes if within 5 minutes of expiration.
   */
  async getValidAccessToken(sessionCookie = null) {
    const connection = await this.getConnection(sessionCookie);
    if (!connection || !connection.accessToken) {
      return null;
    }

    if (connection.status === CONNECTION_STATUS.DISCONNECTED) {
      return null;
    }

    const expiresAt = connection.expiresAt ? new Date(connection.expiresAt).getTime() : 0;
    const isExpiringSoon = Date.now() > (expiresAt - 300000); // within 5 minutes

    if (isExpiringSoon && connection.refreshToken) {
      try {
        return await this.refreshAccessToken(connection.refreshToken);
      } catch (err) {
        logger.error("Auto-refresh failed inside getValidAccessToken", err);
        return connection.accessToken; // Fallback to current token
      }
    }

    return connection.accessToken;
  }

  /**
   * Refreshes access token using the stored refresh token
   */
  async refreshAccessToken(refreshToken) {
    const { clientKey, clientSecret } = this.getClientConfig();
    const timer = logger.startTimer("TikTokAuth.refreshAccessToken");

    let tokenToUse = refreshToken;
    if (!tokenToUse) {
      const conn = await this.getConnection();
      tokenToUse = conn?.refreshToken;
    }

    if (!tokenToUse) {
      const err = new Error("No refresh token available.");
      await connectionRepository.updateStatus("tiktok", CONNECTION_STATUS.REQUIRES_RECONNECTION, err.message);
      throw err;
    }

    try {
      await connectionRepository.updateStatus("tiktok", CONNECTION_STATUS.REFRESHING);

      const response = await fetch(TIKTOK_ENDPOINTS.TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: tokenToUse,
        }),
      });

      const raw = await response.json();
      const payload = raw.data || raw;
      const errorObj = raw.error || (raw.message ? raw : null);

      if (!response.ok || (errorObj && errorObj.code && errorObj.code !== "ok" && errorObj.code !== 0)) {
        const message = errorObj?.message || raw.error_description || "Failed to refresh TikTok access token.";
        throw new Error(message);
      }

      if (!payload.access_token) {
        throw new Error(raw.error_description || "Invalid refresh response from TikTok.");
      }

      const expiresInSeconds = Number(payload.expires_in) || 86400;
      const updatedPayload = {
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token || tokenToUse,
        expiresIn: expiresInSeconds,
        status: CONNECTION_STATUS.CONNECTED,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
        lastError: null,
      };

      await connectionRepository.saveIntegration("tiktok", updatedPayload);
      timer.end("success");
      return payload.access_token;
    } catch (error) {
      timer.error(error);
      await connectionRepository.updateStatus("tiktok", CONNECTION_STATUS.REQUIRES_RECONNECTION, error.message);
      throw error;
    }
  }

  /**
   * Disconnects TikTok connection and revokes/clears stored credentials
   */
  async disconnect() {
    const timer = logger.startTimer("TikTokAuth.disconnect");
    try {
      await connectionRepository.clearCredentials("tiktok");
      timer.end("success");
      return { success: true, status: CONNECTION_STATUS.DISCONNECTED };
    } catch (error) {
      timer.error(error);
      throw error;
    }
  }
}

export const tiktokAuth = new TikTokAuthService();
