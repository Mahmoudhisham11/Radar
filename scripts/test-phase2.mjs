/**
 * RADAR Phase 2 — TikTok Data Engine & Sync Engine Automated Test Suite
 * Tests concurrency locking, smart metric snapshots, deduplication, and zero-mock integrity.
 */

import { syncJobRepository } from "../lib/repositories/syncJobRepository.js";
import { tiktokRepository } from "../lib/repositories/tiktokRepository.js";
import { commentRepository } from "../lib/repositories/commentRepository.js";
import { transformTikTokProfile, transformTikTokVideo } from "../integrations/tiktok/transformers/tiktokTransformers.js";

async function runPhase2Tests() {
  console.log("==================================================");
  console.log("RADAR PHASE 2 — TIKTOK DATA ENGINE & SYNC TESTS");
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

  // --- 1. Concurrency Lock & Duplicate Sync Prevention ---
  console.log("--- 1. Concurrency Locking & Overlap Prevention ---");
  const job1Id = `job_test_1_${Date.now()}`;
  const lock1 = await syncJobRepository.acquireLock(job1Id);
  assert(lock1.acquired === true, "Initial sync lock acquired successfully");

  // Attempting second lock while job 1 is active
  const job2Id = `job_test_2_${Date.now()}`;
  const lock2 = await syncJobRepository.acquireLock(job2Id);
  assert(lock2.acquired === false, "Second concurrent lock correctly rejected (prevents parallel syncs)");
  assert(lock2.activeJobId === job1Id, "Rejection reports active job ID");

  // Release lock 1
  await syncJobRepository.releaseLock(job1Id, "success", { videosProcessed: 18 });
  const lock3 = await syncJobRepository.acquireLock(`job_test_3_${Date.now()}`);
  assert(lock3.acquired === true, "New lock acquired after previous lock released");
  await syncJobRepository.releaseLock(lock3.jobId, "success");

  // --- 2. Smart Metric Diff & Conditional Snapshots ---
  console.log("\n--- 2. Smart Metric Diff & Snapshot Optimization ---");
  const testVideo = {
    id: "vid_sync_001",
    title: "Testing cashier rush hour POS",
    duration: 30,
    publishTime: new Date().toISOString(),
    metrics: { views: 5000, likes: 200, comments: 15, shares: 10, engagementRate: 4.5 },
  };

  // First ingestion: isNew = true, metricsChanged = true
  const firstUpsert = await tiktokRepository.upsertVideoWithMetricDiff(testVideo);
  assert(firstUpsert.isNew === true, "New video correctly detected on initial ingestion");
  assert(firstUpsert.metricsChanged === true, "Initial metrics marked as changed for first snapshot");

  // Second ingestion with IDENTICAL metrics
  const secondUpsert = await tiktokRepository.upsertVideoWithMetricDiff(testVideo);
  assert(secondUpsert.isNew === false, "Existing video recognized on repeat sync");
  assert(secondUpsert.metricsChanged === false, "Identical metrics detected -> snapshot SKIPPED to avoid DB bloat");

  // Third ingestion with CHANGED metrics
  const updatedVideo = {
    ...testVideo,
    metrics: { views: 5500, likes: 250, comments: 18, shares: 12, engagementRate: 5.08 },
  };
  const thirdUpsert = await tiktokRepository.upsertVideoWithMetricDiff(updatedVideo);
  assert(thirdUpsert.metricsChanged === true, "Metric change (views 5000->5500) detected -> triggers snapshot");

  // Historical Snapshot creation
  const snapshot = await tiktokRepository.saveMetricSnapshot(testVideo.id, updatedVideo.metrics);
  assert(snapshot.views === 5500, "Historical snapshot records exact views");
  assert(typeof snapshot.capturedAt === "string", "Snapshot includes immutable capturedAt timestamp");

  // --- 3. Zero Mock Data Audit ---
  console.log("\n--- 3. Zero Mock Data Verification ---");
  const comments = await commentRepository.listComments();
  assert(Array.isArray(comments), "Comments repository returns clean array");
  
  // Verify transformer does not inject fake data for nulls
  const emptyVideo = transformTikTokVideo({ id: "empty_123" });
  assert(emptyVideo.metrics.views === 0, "Empty views default to 0 (no fake numbers injected)");
  assert(emptyVideo.metrics.likes === 0, "Empty likes default to 0 (no fake numbers injected)");

  console.log("\n==================================================");
  console.log(`PHASE 2 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runPhase2Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
