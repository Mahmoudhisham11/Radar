/**
 * Connection Repository
 * Stores and manages external integration credentials and status (e.g. TikTok OAuth).
 * Ensures sensitive tokens are stored securely and sanitized before client access.
 */

import { BaseRepository } from "./baseRepository.js";
import { COLLECTIONS, CONNECTION_STATUS } from "@/lib/firebase/collections";
import { logger } from "@/lib/logger";

// In-memory fallback cache for development/testing when Firestore Admin isn't configured
const memStore = new Map();

export class ConnectionRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CONNECTIONS);
  }

  async getIntegration(provider) {
    try {
      const doc = await this.findById(provider);
      if (doc) return doc;
    } catch (err) {
      logger.warn(`Firestore unavailable for getIntegration(${provider}), using memStore: ${err.message}`);
    }
    return memStore.get(provider) || null;
  }

  async saveIntegration(provider, data) {
    const payload = {
      provider,
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    memStore.set(provider, { ...memStore.get(provider), ...payload });

    try {
      return await this.create(provider, payload);
    } catch (err) {
      logger.warn(`Firestore unavailable for saveIntegration(${provider}), saved to memStore: ${err.message}`);
      return payload;
    }
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
    memStore.set(provider, { ...current, ...updatePayload });

    try {
      return await this.update(provider, updatePayload);
    } catch (err) {
      logger.warn(`Firestore unavailable for updateStatus(${provider}), updated memStore: ${err.message}`);
      return { id: provider, ...current, ...updatePayload };
    }
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
    memStore.set(provider, { ...current, ...updatePayload });

    try {
      return await this.update(provider, updatePayload);
    } catch (err) {
      logger.warn(`Firestore unavailable for clearCredentials(${provider}): ${err.message}`);
      return { id: provider, ...current, ...updatePayload };
    }
  }

  async getTikTokConnection() {
    return this.getIntegration("tiktok");
  }

  /**
   * Sanitized public status object safe to send to React frontend.
   * NEVER returns accessToken, refreshToken, or client secrets.
   */
  async getPublicTikTokStatus() {
    const conn = await this.getTikTokConnection();
    if (!conn) {
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
      status: conn.status || CONNECTION_STATUS.DISCONNECTED,
      username: conn.username || null,
      displayName: conn.displayName || null,
      avatarUrl: conn.avatarUrl || null,
      openId: conn.openId || null,
      connectedAt: conn.connectedAt || null,
      lastUpdated: conn.lastUpdated || null,
      lastError: conn.lastError || null,
    };
  }
}

export const connectionRepository = new ConnectionRepository();
