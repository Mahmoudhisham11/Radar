/**
 * Business Context Repository
 * Manages persistent storage of business identity, audience profile, offers, and marketing targets in Firestore.
 * Zero mock data — Stores real configured business context with resilient in-memory fallback.
 */

import { BaseRepository } from "./baseRepository.js";
import { COLLECTIONS } from "../firebase/collections.js";
import { logger } from "../logger/index.js";

const memBusinessContext = new Map();

export const BUSINESS_CONTEXT_DOC_ID = "business_context";

export class BusinessContextRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.SETTINGS);
  }

  /**
   * Retrieves the current business context.
   * Returns empty structured defaults if not yet configured.
   */
  async getContext() {
    try {
      const doc = await this.findById(BUSINESS_CONTEXT_DOC_ID);
      if (doc) {
        memBusinessContext.set(BUSINESS_CONTEXT_DOC_ID, doc);
        return doc;
      }
    } catch (err) {
      logger.warn(`Firestore unavailable for getContext: ${err.message}`);
    }

    return (
      memBusinessContext.get(BUSINESS_CONTEXT_DOC_ID) || {
        id: BUSINESS_CONTEXT_DOC_ID,
        business: {
          businessName: "",
          businessDescription: "",
          productService: "",
          industry: "",
        },
        audience: {
          targetAudience: "",
          customerProblems: "",
        },
        offer: {
          mainOffer: "",
          pricing: "",
          competitiveAdvantages: "",
          primaryCta: "",
        },
        marketing: {
          mainMarketingGoal: "",
          secondaryGoals: "",
          brandTone: "",
          contentPillars: "",
          currentCampaigns: "",
          currentOffers: "",
          importantNotes: "",
        },
        updatedAt: null,
      }
    );
  }

  /**
   * Saves or updates the business context in Firestore.
   */
  async saveContext(contextData) {
    const timestamp = new Date().toISOString();
    const payload = {
      id: BUSINESS_CONTEXT_DOC_ID,
      business: {
        businessName: contextData.business?.businessName?.trim() || "",
        businessDescription: contextData.business?.businessDescription?.trim() || "",
        productService: contextData.business?.productService?.trim() || "",
        industry: contextData.business?.industry?.trim() || "",
      },
      audience: {
        targetAudience: contextData.audience?.targetAudience?.trim() || "",
        customerProblems: contextData.audience?.customerProblems?.trim() || "",
      },
      offer: {
        mainOffer: contextData.offer?.mainOffer?.trim() || "",
        pricing: contextData.offer?.pricing?.trim() || "",
        competitiveAdvantages: contextData.offer?.competitiveAdvantages?.trim() || "",
        primaryCta: contextData.offer?.primaryCta?.trim() || "",
      },
      marketing: {
        mainMarketingGoal: contextData.marketing?.mainMarketingGoal?.trim() || "",
        secondaryGoals: contextData.marketing?.secondaryGoals?.trim() || "",
        brandTone: contextData.marketing?.brandTone?.trim() || "",
        contentPillars: contextData.marketing?.contentPillars?.trim() || "",
        currentCampaigns: contextData.marketing?.currentCampaigns?.trim() || "",
        currentOffers: contextData.marketing?.currentOffers?.trim() || "",
        importantNotes: contextData.marketing?.importantNotes?.trim() || "",
      },
      updatedAt: timestamp,
    };

    memBusinessContext.set(BUSINESS_CONTEXT_DOC_ID, payload);

    try {
      await this.create(BUSINESS_CONTEXT_DOC_ID, payload);
    } catch (err) {
      logger.warn(`Firestore unavailable for saveContext, saved in memory: ${err.message}`);
    }

    return payload;
  }
}

export const businessContextRepository = new BusinessContextRepository();
