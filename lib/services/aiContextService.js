/**
 * AI Context Service (Future AI Boundary)
 *
 * Establishes a clean, structured interface for future AI reasoning.
 * Combines Business Context + Marketing Goals + Deterministic Analytics Summary
 * without sending raw massive database dumps or expecting AI to perform arithmetic.
 */

import { businessContextService } from "./businessContextService.js";
import { analyticsService } from "./analyticsService.js";
import { TIME_PERIODS } from "../analytics/marketingAnalyticsEngine.js";
import { logger } from "../logger/index.js";

export class AIContextService {
  constructor(
    bizService = businessContextService,
    analytics = analyticsService
  ) {
    this.bizService = bizService;
    this.analytics = analytics;
  }

  /**
   * Assembles a normalized marketing context package.
   *
   * @param {Object} [options]
   * @param {string} [options.period="30d"] - Evaluation period for analytics
   * @returns {Promise<Object>} Unified context object
   */
  async getMarketingContext(options = {}) {
    const period = options.period || TIME_PERIODS.P30D;

    try {
      const [bizContext, analyticsResult] = await Promise.all([
        this.bizService.getBusinessContext(),
        this.analytics.getMarketingAnalytics(period),
      ]);

      const isBizConfigured = this.bizService.isConfigured(bizContext);

      return {
        timestamp: new Date().toISOString(),
        evaluationPeriod: period,
        business: {
          isConfigured: isBizConfigured,
          name: bizContext.business?.businessName || "غير محدد",
          industry: bizContext.business?.industry || "غير محدد",
          productService: bizContext.business?.productService || "غير محدد",
          description: bizContext.business?.businessDescription || "غير محدد",
        },
        audience: {
          target: bizContext.audience?.targetAudience || "غير محدد",
          problems: bizContext.audience?.customerProblems || "غير محدد",
        },
        offer: {
          main: bizContext.offer?.mainOffer || "غير محدد",
          pricing: bizContext.offer?.pricing || "غير محدد",
          advantages: bizContext.offer?.competitiveAdvantages || "غير محدد",
          cta: bizContext.offer?.primaryCta || "غير محدد",
        },
        marketingGoals: {
          primary: bizContext.marketing?.mainMarketingGoal || "غير محدد",
          secondary: bizContext.marketing?.secondaryGoals || "غير محدد",
          brandTone: bizContext.marketing?.brandTone || "غير محدد",
          pillars: bizContext.marketing?.contentPillars || "غير محدد",
          currentCampaigns: bizContext.marketing?.currentCampaigns || "غير محدد",
          currentOffers: bizContext.marketing?.currentOffers || "غير محدد",
          importantNotes: bizContext.marketing?.importantNotes || "غير محدد",
        },
        analyticsSummary: {
          dataQuality: analyticsResult.dataQuality,
          contentCount: analyticsResult.content.videosPublishedInPeriod,
          totalCatalog: analyticsResult.content.totalVideosInCatalog,
          views: analyticsResult.views,
          likes: analyticsResult.likes,
          comments: analyticsResult.comments,
          shares: analyticsResult.shares,
          engagementRate: analyticsResult.engagement.rateFormatted,
          postingPace: analyticsResult.posting,
          topPerformingVideos: analyticsResult.rankings.byViews.slice(0, 3).map((v) => ({
            id: v.id,
            title: v.title,
            views: v.views,
            likes: v.likes,
            engagementRate: v.engagementRate,
          })),
        },
      };
    } catch (error) {
      logger.error("Failed to assemble AI marketing context", error);
      throw error;
    }
  }
}

export const aiContextService = new AIContextService();
