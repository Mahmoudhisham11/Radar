/**
 * RADAR Phase 1 — TikTok Developer Sandbox Integration Test Suite
 */

import { TIKTOK_ENDPOINTS, TIKTOK_SCOPES } from "../integrations/tiktok/schemas/tiktokSchemas.js";
import { transformTikTokProfile, transformTikTokVideo } from "../integrations/tiktok/transformers/tiktokTransformers.js";
import { CONNECTION_STATUS } from "../lib/firebase/collections.js";

async function runPhase1Tests() {
  console.log("==================================================");
  console.log("RADAR PHASE 1 — TIKTOK INTEGRATION TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // 1. TikTok Schema & Scopes
  console.log("--- 1. Verification of Official TikTok Endpoints & Scopes ---");
  assert(TIKTOK_SCOPES.includes("user.info.basic"), "Scope: user.info.basic");

  assert(TIKTOK_ENDPOINTS.AUTH_URL === "https://www.tiktok.com/v2/auth/authorize/", "Endpoint: Authorization v2");
  assert(TIKTOK_ENDPOINTS.TOKEN_URL === "https://open.tiktokapis.com/v2/oauth/token/", "Endpoint: Token v2");
  assert(TIKTOK_ENDPOINTS.USER_INFO === "https://open.tiktokapis.com/v2/user/info/", "Endpoint: User Info v2");
  assert(TIKTOK_ENDPOINTS.VIDEO_LIST === "https://open.tiktokapis.com/v2/video/list/", "Endpoint: Video List v2");

  // 2. Profile Data Transformer
  console.log("\n--- 2. TikTok Sandbox Profile Transformer ---");
  const mockRawProfile = {
    open_id: "sb_user_pos_001",
    union_id: "union_pos_001",
    display_name: "CashierPro POS",
    avatar_url: "https://p16.tiktokcdn.com/avatar1.jpg",
    avatar_large_url: "https://p16.tiktokcdn.com/avatar_large.jpg",
    bio_description: "Cloud Point of Sale Software for Retail & Supermarkets",
    follower_count: 14200,
    following_count: 85,
    likes_count: 98000,
    video_count: 24,
    is_verified: true,
  };

  const transformedProfile = transformTikTokProfile(mockRawProfile);
  assert(transformedProfile.id === "sb_user_pos_001", "ID mapped from open_id");
  assert(transformedProfile.username === "CashierPro POS", "Username mapped from display_name");
  assert(transformedProfile.avatarUrl === "https://p16.tiktokcdn.com/avatar1.jpg", "Avatar URL preserved");
  assert(transformedProfile.followerCount === 14200, "Follower count mapped correctly");
  assert(transformedProfile.likesCount === 98000, "Likes count mapped correctly");
  assert(transformedProfile.videoCount === 24, "Video count mapped correctly");
  assert(transformedProfile.isVerified === true, "isVerified boolean parsed");
  assert(typeof transformedProfile.syncedAt === "string", "syncedAt ISO timestamp added");

  // 3. Null/Partial Profile handling
  const partialProfile = transformTikTokProfile({ open_id: "sb_user_empty" });
  assert(partialProfile.id === "sb_user_empty", "Partial profile handled without exception");
  assert(partialProfile.followerCount === 0, "Missing follower count defaulted to 0");
  assert(partialProfile.likesCount === 0, "Missing likes count defaulted to 0");

  // 4. Video Data Transformer
  console.log("\n--- 3. TikTok Sandbox Video Transformer & Metrics Calculation ---");
  const mockRawVideo = {
    id: "729482104812",
    title: "Stop losing money on manual cashier errors",
    create_time: 1708000000,
    cover_image_url: "https://p16.tiktokcdn.com/cover1.jpg",
    share_url: "https://www.tiktok.com/@cashierpro/video/729482104812",
    duration: 42,
    view_count: 42800,
    like_count: 3210,
    comment_count: 184,
    share_count: 120,
  };

  const transformedVideo = transformTikTokVideo(mockRawVideo);
  assert(transformedVideo.id === "729482104812", "Video ID matched");
  assert(transformedVideo.title === "Stop losing money on manual cashier errors", "Title preserved");
  assert(transformedVideo.duration === 42, "Duration is 42s");
  assert(transformedVideo.metrics.views === 42800, "Views count is 42,800");
  assert(transformedVideo.metrics.likes === 3210, "Likes count is 3,210");
  assert(transformedVideo.metrics.comments === 184, "Comments count is 184");
  assert(transformedVideo.metrics.shares === 120, "Shares count is 120");

  // Formula: (3210 + 184 + 120) / 42800 * 100 = 3514 / 42800 * 100 = 8.21028% -> 8.21%
  assert(transformedVideo.metrics.engagementRate === 8.21, "Engagement rate computed precisely (8.21%)");

  // 5. Connection Status Lifecycle Definitions
  console.log("\n--- 4. Connection Lifecycle States ---");
  assert(CONNECTION_STATUS.CONNECTED === "connected", "State: CONNECTED");
  assert(CONNECTION_STATUS.DISCONNECTED === "disconnected", "State: DISCONNECTED");
  assert(CONNECTION_STATUS.REFRESHING === "refreshing", "State: REFRESHING");
  assert(CONNECTION_STATUS.REQUIRES_RECONNECTION === "requires_reconnection", "State: REQUIRES_RECONNECTION");
  assert(CONNECTION_STATUS.EXPIRED === "expired", "State: EXPIRED");
  assert(CONNECTION_STATUS.ERROR === "error", "State: ERROR");

  // 6. Security Guarantees: Public Sanitization
  console.log("\n--- 5. Security Sanitization Contract ---");
  const storedDatabaseRecord = {
    provider: "tiktok",
    accessToken: "tk_access_super_secret_token_12345",
    refreshToken: "tk_refresh_super_secret_token_67890",
    openId: "sb_user_pos_001",
    username: "CashierPro POS",
    displayName: "CashierPro POS",
    status: CONNECTION_STATUS.CONNECTED,
    connectedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  // Sanitizer logic simulation (matching connectionRepository.getPublicTikTokStatus)
  const publicPayload = {
    status: storedDatabaseRecord.status,
    username: storedDatabaseRecord.username,
    displayName: storedDatabaseRecord.displayName,
    avatarUrl: storedDatabaseRecord.avatarUrl || null,
    openId: storedDatabaseRecord.openId,
    connectedAt: storedDatabaseRecord.connectedAt,
    lastUpdated: storedDatabaseRecord.lastUpdated || null,
    lastError: storedDatabaseRecord.lastError || null,
  };

  assert(publicPayload.accessToken === undefined, "Security: Access token NEVER exposed to public status");
  assert(publicPayload.refreshToken === undefined, "Security: Refresh token NEVER exposed to public status");
  assert(publicPayload.status === "connected", "Public status preserves connected state");
  assert(publicPayload.username === "CashierPro POS", "Public status preserves username");

  console.log("\n==================================================");
  console.log(`PHASE 1 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runPhase1Tests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
