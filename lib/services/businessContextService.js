/**
 * Business Context Service
 * Centralized business domain service for managing business memory and marketing targets.
 */

import { businessContextRepository } from "../repositories/businessContextRepository.js";
import { logger } from "../logger/index.js";

export class BusinessContextService {
  constructor(repository = businessContextRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves the structured Business Context.
   */
  async getBusinessContext() {
    return await this.repository.getContext();
  }

  /**
   * Validates and updates the Business Context.
   */
  async updateBusinessContext(contextData) {
    const validation = this.validate(contextData);
    if (!validation.isValid) {
      throw new Error(`Validation Error: ${validation.errors.join(", ")}`);
    }

    const saved = await this.repository.saveContext(contextData);
    logger.info("Business Context updated successfully", {
      businessName: saved.business.businessName,
    });
    return saved;
  }

  /**
   * Validates Business Context data without over-constraining flexible descriptions.
   */
  validate(contextData) {
    const errors = [];

    if (!contextData || typeof contextData !== "object") {
      return { isValid: false, errors: ["Context data must be an object"] };
    }

    // Business Name check (if provided, must not be purely whitespace)
    if (
      contextData.business?.businessName !== undefined &&
      typeof contextData.business.businessName === "string" &&
      contextData.business.businessName.length > 0 &&
      contextData.business.businessName.trim().length === 0
    ) {
      errors.push("اسم النشاط التجاري لا يمكن أن يكون مسافات فارغة فقط.");
    }

    // Ensure maximum character lengths to avoid database bloat
    if (contextData.business?.businessDescription?.length > 3000) {
      errors.push("وصف النشاط التجاري طويل جداً (الحد الأقصى 3000 حرف).");
    }

    if (contextData.marketing?.importantNotes?.length > 3000) {
      errors.push("الملاحظات الاستراتيجية طويلة جداً (الحد الأقصى 3000 حرف).");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks whether the business context has been minimally configured.
   */
  isConfigured(context) {
    if (!context) return false;
    return Boolean(
      context.business?.businessName ||
      context.business?.productService ||
      context.offer?.mainOffer ||
      context.marketing?.mainMarketingGoal
    );
  }
}

export const businessContextService = new BusinessContextService();
