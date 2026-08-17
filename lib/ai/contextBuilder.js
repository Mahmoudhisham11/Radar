/**
 * AI Context Builder & Memory
 * Dynamically builds context for LLM queries instead of giant monolithic prompts.
 */

import { customerRepository } from "@/lib/repositories/customerRepository";
import { leadRepository } from "@/lib/repositories/leadRepository";
import { goalRepository } from "@/lib/repositories/goalRepository";
import { tiktokRepository } from "@/lib/repositories/tiktokRepository";

export class AIContextBuilder {
  async buildExecutiveSummary() {
    try {
      const [customerStats, leadStats, activeGoals, tiktokProfile] = await Promise.all([
        customerRepository.getCustomerMetrics().catch(() => ({ total: 0, active: 0, totalRevenue: 0 })),
        leadRepository.getPipelineCounts().catch(() => ({ total: 0, stages: {} })),
        goalRepository.getActiveGoals().catch(() => []),
        tiktokRepository.getProfile().catch(() => null),
      ]);

      return {
        business: {
          product: "POS & Cashier Software",
          customerCount: customerStats.total,
          activeCustomers: customerStats.active,
          totalRevenue: customerStats.totalRevenue,
        },
        marketing: {
          tiktokFollowers: tiktokProfile?.followerCount || 0,
          totalLeads: leadStats.total,
          leadsByStage: leadStats.stages,
        },
        goals: activeGoals.map(g => ({
          title: g.title,
          target: g.target,
          current: g.current,
          status: g.status,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        business: { product: "POS & Cashier Software" },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const contextBuilder = new AIContextBuilder();
