/**
 * Customer & Sales Repositories
 * Manages Paying Customers, Inactive Customers, and Transaction records.
 */

import { BaseRepository } from "./baseRepository";
import { COLLECTIONS } from "@/lib/firebase/collections";

export class CustomerRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CUSTOMERS);
  }

  async findByStatus(status) {
    const snapshot = await this.getCollection().where("status", "==", status).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getCustomerMetrics() {
    const all = await this.list(500);
    const active = all.filter(c => c.status === "active").length;
    const totalRevenue = all.reduce((sum, c) => sum + (Number(c.totalSpend) || 0), 0);
    return {
      total: all.length,
      active,
      inactive: all.length - active,
      totalRevenue,
    };
  }
}

export class SalesRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.SALES);
  }

  async getRecentSales(limit = 20) {
    try {
      const snapshot = await this.getCollection().orderBy("date", "desc").limit(limit).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      return this.list(limit);
    }
  }
}

export const customerRepository = new CustomerRepository();
export const salesRepository = new SalesRepository();
