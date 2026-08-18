/**
 * RADAR Firestore Collection Constants
 * Centralized registry of all database collections to prevent magic strings.
 */

export const COLLECTIONS = {
  SETTINGS: "settings",
  CONNECTIONS: "connections",
  TIKTOK_PROFILES: "tiktok_profiles",
  TIKTOK_VIDEOS: "tiktok_videos",
  TIKTOK_VIDEO_METRICS: "tiktok_video_metrics",
  COMMENTS: "comments",
  CUSTOMERS: "customers",
  LEADS: "leads",
  SALES: "sales",
  GOALS: "goals",
  TASKS: "tasks",
  INSIGHTS: "insights",
  ATTENTION_ITEMS: "attention_items",
  AI_CONVERSATIONS: "ai_conversations",
  AI_MESSAGES: "ai_messages",
  SYNC_JOBS: "sync_jobs",
  SYNC_LOGS: "sync_logs",
  EVENTS: "events",
};

export const CONNECTION_STATUS = {
  CONNECTED: "connected",
  EXPIRED: "expired",
  REFRESHING: "refreshing",
  ERROR: "error",
  DISCONNECTED: "disconnected",
  REQUIRES_RECONNECTION: "requires_reconnection",
};

export const LEAD_STATUS = {
  NEW: "new",
  CONTACTED: "contacted",
  INTERESTED: "interested",
  DEMO: "demo",
  NEGOTIATION: "negotiation",
  WON: "won",
  LOST: "lost",
};

export const GOAL_STATUS = {
  AHEAD: "ahead",
  ON_TRACK: "on_track",
  AT_RISK: "at_risk",
  BEHIND: "behind",
};

export const INSIGHT_TYPE = {
  PROBLEM: "problem",
  OPPORTUNITY: "opportunity",
  TREND: "trend",
  RECOMMENDATION: "recommendation",
};

export const ATTENTION_SEVERITY = {
  CRITICAL: "critical",
  WARNING: "warning",
  OPPORTUNITY: "opportunity",
  REMINDER: "reminder",
};
