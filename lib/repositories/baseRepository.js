/**
 * Base Repository Pattern for Firestore
 * Abstract data-access logic so UI and business services never directly scatter raw queries.
 */

import { getAdminFirebase } from "../firebase/admin.js";
import { logger } from "../logger/index.js";

export class BaseRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getDb() {
    const { adminDb, isConfigured } = getAdminFirebase();
    if (!isConfigured || !adminDb) {
      throw new Error(`Firestore Admin is not configured. Cannot perform DB operation on [${this.collectionName}].`);
    }
    return adminDb;
  }

  getCollection() {
    return this.getDb().collection(this.collectionName);
  }

  async findById(id) {
    try {
      const doc = await this.getCollection().doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error(`Error in findById for [${this.collectionName}]`, error, { id });
      throw error;
    }
  }

  async create(id, data) {
    try {
      const timestamp = new Date().toISOString();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (id) {
        await this.getCollection().doc(id).set(docData, { merge: true });
        return { id, ...docData };
      } else {
        const docRef = await this.getCollection().add(docData);
        return { id: docRef.id, ...docData };
      }
    } catch (error) {
      logger.error(`Error in create for [${this.collectionName}]`, error, { id });
      throw error;
    }
  }

  async update(id, data) {
    try {
      const timestamp = new Date().toISOString();
      const updateData = {
        ...data,
        updatedAt: timestamp,
      };
      await this.getCollection().doc(id).set(updateData, { merge: true });
      return { id, ...updateData };
    } catch (error) {
      logger.error(`Error in update for [${this.collectionName}]`, error, { id });
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.getCollection().doc(id).delete();
      return { id, deleted: true };
    } catch (error) {
      logger.error(`Error in delete for [${this.collectionName}]`, error, { id });
      throw error;
    }
  }

  async list(limit = 50) {
    try {
      const snapshot = await this.getCollection().limit(limit).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error(`Error in list for [${this.collectionName}]`, error);
      throw error;
    }
  }
}
