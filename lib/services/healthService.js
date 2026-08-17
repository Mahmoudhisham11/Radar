/**
 * System Health Service
 * Provides health checks across Firebase, TikTok, AI Provider, and Sync subsystem.
 */

import { getAdminFirebase } from "@/lib/firebase/admin";
import { connectionRepository } from "@/lib/repositories/connectionRepository";
import { syncRepository } from "@/lib/repositories/goalRepository";
import { logger } from "@/lib/logger";

export async function checkSystemHealth() {
  const health = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    services: {
      firebase: { status: "unknown", configured: false },
      tiktokConnection: { status: "unknown", configured: false },
      aiProvider: { status: "unknown", configured: false },
      syncEngine: { status: "idle", lastSync: null },
    },
  };

  // 1. Firebase Check
  try {
    const { isConfigured, adminDb } = getAdminFirebase();
    health.services.firebase.configured = isConfigured;
    if (isConfigured && adminDb) {
      health.services.firebase.status = "connected";
    } else {
      health.services.firebase.status = "unconfigured";
    }
  } catch (err) {
    health.services.firebase.status = "error";
    health.services.firebase.error = err.message;
  }

  // 2. TikTok Connection Check
  try {
    const isTiktokEnvSet = Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
    health.services.tiktokConnection.configured = isTiktokEnvSet;
    if (health.services.firebase.status === "connected") {
      const conn = await connectionRepository.getTikTokConnection();
      health.services.tiktokConnection.status = conn ? conn.status : "disconnected";
    } else {
      health.services.tiktokConnection.status = isTiktokEnvSet ? "ready_to_connect" : "unconfigured";
    }
  } catch (err) {
    health.services.tiktokConnection.status = "error";
  }

  // 3. AI Provider Check
  const isOpenRouterSet = Boolean(process.env.OPENROUTER_API_KEY);
  health.services.aiProvider.configured = isOpenRouterSet;
  health.services.aiProvider.status = isOpenRouterSet ? "ready" : "unconfigured";
  health.services.aiProvider.model = process.env.OPENROUTER_DEFAULT_MODEL || "anthropic/claude-3.5-sonnet";

  // 4. Sync Subsystem Check
  try {
    if (health.services.firebase.status === "connected") {
      const latestSync = await syncRepository.getLatestSync();
      if (latestSync) {
        health.services.syncEngine.lastSync = latestSync.timestamp;
        health.services.syncEngine.status = latestSync.status;
      }
    }
  } catch {}

  // Determine overall status
  if (health.services.firebase.status === "error" || health.services.tiktokConnection.status === "error") {
    health.status = "degraded";
  }

  return health;
}
