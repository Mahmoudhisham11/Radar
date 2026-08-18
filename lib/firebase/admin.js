/**
 * Server-Side Firebase Admin Initialization
 * Privileged operations MUST remain server-side.
 * Never expose Admin credentials to the client.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "../logger/index.js";

let adminApp = null;
let adminDb = null;

export function getAdminFirebase() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey && typeof privateKey === "string") {
    // Handle escaped newlines in environment variables
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const isConfigured = Boolean(projectId && clientEmail && privateKey);

  if (!isConfigured) {
    logger.debug("Firebase Admin credentials not fully configured in environment.");
    return { adminApp: null, adminDb: null, isConfigured: false };
  }

  try {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminApp = getApps()[0];
    }

    adminDb = getFirestore(adminApp);
    return { adminApp, adminDb, isConfigured: true };
  } catch (error) {
    logger.error("Failed to initialize Firebase Admin SDK", error);
    return { adminApp: null, adminDb: null, isConfigured: false };
  }
}
