/**
 * Lead Repository
 * Manages Lead Pipeline, Lead Sources, and Conversion States.
 */

import { BaseRepository } from "./baseRepository";
import { COLLECTIONS, LEAD_STATUS } from "@/lib/firebase/collections";

export class LeadRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.LEADS);
  }

  async findByStage(stage) {
    const snapshot = await this.getCollection().where("stage", "==", stage).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getPipelineCounts() {
    const leads = await this.list(500);
    const stages = Object.values(LEAD_STATUS).reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {});

    leads.forEach(lead => {
      const stage = lead.stage || LEAD_STATUS.NEW;
      if (stages[stage] !== undefined) {
        stages[stage] += 1;
      }
    });

    return {
      total: leads.length,
      stages,
      needsFollowup: leads.filter(l => l.needsFollowup).length,
    };
  }
}

export const leadRepository = new LeadRepository();
