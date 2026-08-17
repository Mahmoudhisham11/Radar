/**
 * Client-Side Firebase Initialization
 * Exposes Firestore instance for browser realtime listeners and subscriptions.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { logger } from "@/lib/logger";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app = null;
let db = null;

export function getClientFirebase() {
  if (typeof window === "undefined") {
    return { app: null, db: null, isConfigured: false };
  }

  const isConfigured = Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.projectId
  );

  if (!isConfigured) {
    logger.debug("Client Firebase credentials not fully configured in environment.");
    return { app: null, db: null, isConfigured: false };
  }

  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    return { app, db, isConfigured: true };
  } catch (error) {
    logger.error("Failed to initialize Client Firebase", error);
    return { app: null, db: null, isConfigured: false };
  }
}

export { db };
