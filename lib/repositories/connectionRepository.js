/**
 * Connection Repository
 * Stores and manages external integration credentials and status (e.g. TikTok OAuth).
 */

import { BaseRepository } from "./baseRepository";
import { COLLECTIONS, CONNECTION_STATUS } from "@/lib/firebase/collections";
import { logger } from "@/lib/logger";

export class ConnectionRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CONNECTIONS);
  }

  async getIntegration(provider) {
    return this.findById(provider);
  }

  async saveIntegration(provider, data) {
    return this.create(provider, {
      provider,
      ...data,
      lastUpdated: new Date().toISOString(),
    });
  }

  async updateStatus(provider, status, errorDetails = null) {
    const updatePayload = {
      status,
      lastStatusCheck: new Date().toISOString(),
    };
    if (errorDetails) {
      updatePayload.lastError = errorDetails;
    }
    return this.update(provider, updatePayload);
  }

  async getTikTokConnection() {
    return this.findById("tiktok");
  }
}

export const connectionRepository = new ConnectionRepository();
