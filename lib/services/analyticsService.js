/**
 * Analytics Domain Service
 * Retrieves normalized video data from TikTok Repository and executes Marketing Analytics Engine.
 */

import { tiktokRepository } from "../repositories/tiktokRepository.js";
import { marketingAnalyticsEngine, TIME_PERIODS } from "../analytics/marketingAnalyticsEngine.js";
import { logger } from "../logger/index.js";

export class AnalyticsService {
  constructor(repository = tiktokRepository, engine = marketingAnalyticsEngine) {
    this.repository = repository;
    this.engine = engine;
  }

  /**
   * Retrieves analytics for a specified time period.
   *
   * @param {string} [period="all"] - "7d" | "30d" | "90d" | "all"
   * @param {Date} [now] - Optional reference date
   * @returns {Promise<Object>} Calculated analytics results
   */
  async getMarketingAnalytics(period = TIME_PERIODS.ALL, now) {
    try {
      const videos = await this.repository.listVideos(500);
      return this.engine.calculateAnalytics(videos, { period, now });
    } catch (error) {
      logger.error("Failed to compute marketing analytics", error, { period });
      throw error;
    }
  }

  /**
   * Computes analytics on an in-memory video array (e.g. from client realtime hook).
   */
  calculateFromVideos(videos = [], period = TIME_PERIODS.ALL, now) {
    return this.engine.calculateAnalytics(videos, { period, now });
  }
}

export const analyticsService = new AnalyticsService();
