/**
 * Connection Repository
 * Stores and manages external integration credentials and status (e.g. TikTok OAuth).
 * Ensures sensitive tokens are stored securely and sanitized before client access.
 * Multi-layer persistence: Firestore + In-Memory + Session Cache fallback.
 */

import { BaseRepository } from "./baseRepository.js";
import { COLLECTIONS, CONNECTION_STATUS } from "../firebase/collections.js";
import { logger } from "../logger/index.js";
import { decodeSessionPayload, encodeSessionPayload, TIKTOK_COOKIE_NAME } from "@/integrations/tiktok/auth/tiktokSession.js";

// In-memory fallback cache for development/testing when Firestore Admin isn't configured
const memStore = new Map();

export class ConnectionRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CONNECTIONS);
  }

  /**
   * Reads integration document from Firestore, with fallback to in-memory store and cookie
   */
  async getIntegration(provider, sessionCookie = null) {
    // 1. Try Firestore
    try {
      const doc = await this.findById(provider);
      if (doc && doc.accessToken) {
        memStore.set(provider, doc);
        return doc;
      }
    } catch (err) {
      logger.debug(`Firestore unavailable for getIntegration(${provider}): ${err.message}`);
    }

    // 2. Try In-Memory Store
    const memData = memStore.get(provider);
    if (memData && memData.accessToken) {
      return memData;
    }

    // 3. Try Session Cookie if provided
    if (sessionCookie) {
      const decoded = decodeSessionPayload(sessionCookie);
      if (decoded && decoded.provider === provider && decoded.accessToken) {
        memStore.set(provider, decoded);
        return decoded;
      }
    }

    // 4. Try reading cookie from next/headers if in a request context
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get(TIKTOK_COOKIE_NAME)?.value;
      if (cookieVal) {
        const decoded = decodeSessionPayload(cookieVal);
        if (decoded && decoded.provider === provider && decoded.accessToken) {
          memStore.set(provider, decoded);
          return decoded;
        }
      }
    } catch {
      // Outside request context (e.g. background job or test script)
    }

    return memData || null;
  }

  /**
   * Saves integration to Firestore, in-memory store, and returns encoded session payload
   */
  async saveIntegration(provider, data) {
    const existing = memStore.get(provider) || {};
    const payload = {
      provider,
      ...existing,
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    memStore.set(provider, payload);

    try {
      await this.create(provider, payload);
    } catch (err) {
      logger.debug(`Firestore unavailable for saveIntegration(${provider}), using memStore: ${err.message}`);
    }

    return payload;
  }

  async updateStatus(provider, status, errorDetails = null) {
    const updatePayload = {
      status,
      lastStatusCheck: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    if (errorDetails) {
      updatePayload.lastError = typeof errorDetails === "string" ? errorDetails : errorDetails?.message || JSON.stringify(errorDetails);
    } else if (status === CONNECTION_STATUS.CONNECTED) {
      updatePayload.lastError = null;
    }

    const current = memStore.get(provider) || {};
    const updated = { ...current, ...updatePayload };
    memStore.set(provider, updated);

    try {
      await this.update(provider, updatePayload);
    } catch (err) {
      logger.debug(`Firestore unavailable for updateStatus(${provider}): ${err.message}`);
    }

    return { id: provider, ...updated };
  }

  async clearCredentials(provider) {
    const updatePayload = {
      status: CONNECTION_STATUS.DISCONNECTED,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      disconnectedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    const current = memStore.get(provider) || {};
    const updated = { ...current, ...updatePayload };
    memStore.set(provider, updated);

    try {
      await this.update(provider, updatePayload);
    } catch (err) {
      logger.debug(`Firestore unavailable for clearCredentials(${provider}): ${err.message}`);
    }

    return { id: provider, ...updated };
  }

  async getTikTokConnection(sessionCookie = null) {
    return this.getIntegration("tiktok", sessionCookie);
  }

  /**
   * Sanitized public status object safe to send to React frontend.
   * NEVER returns accessToken, refreshToken, or client secrets.
   */
  async getPublicTikTokStatus(sessionCookie = null) {
    const conn = await this.getTikTokConnection(sessionCookie);
    if (!conn || !conn.accessToken || conn.status === CONNECTION_STATUS.DISCONNECTED) {
      return {
        status: CONNECTION_STATUS.DISCONNECTED,
        username: null,
        displayName: null,
        avatarUrl: null,
        openId: null,
        connectedAt: null,
        lastUpdated: null,
        lastError: null,
      };
    }

    return {
      status: conn.status || CONNECTION_STATUS.CONNECTED,
      username: conn.username || null,
      displayName: conn.displayName || null,
      avatarUrl: conn.avatarUrl || null,
      openId: conn.openId || null,
      connectedAt: conn.connectedAt || null,
      lastUpdated: conn.lastUpdated || null,
      lastError: conn.lastError || null,
    };
  }

  /**
   * Generates encoded session cookie string
   */
  generateSessionCookie(provider = "tiktok") {
    const conn = memStore.get(provider);
    if (!conn) return null;
    return encodeSessionPayload(conn);
  }
}

export const connectionRepository = new ConnectionRepository();
