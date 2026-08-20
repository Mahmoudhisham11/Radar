/**
 * RADAR — Phase 3A Automated Test Suite
 * Validates Business Context System, Deterministic Marketing Analytics Engine, and AI Context Boundary.
 */

import { businessContextRepository } from "../lib/repositories/businessContextRepository.js";
import { businessContextService } from "../lib/services/businessContextService.js";
import { marketingAnalyticsEngine, TIME_PERIODS } from "../lib/analytics/marketingAnalyticsEngine.js";
import { analyticsService } from "../lib/services/analyticsService.js";
import { aiContextService } from "../lib/services/aiContextService.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("\n==================================================");
  console.log("  RADAR PHASE 3A AUTOMATED TEST SUITE");
  console.log("==================================================\n");

  // ----------------------------------------------------
  // TEST GROUP 1: Business Context System
  // ----------------------------------------------------
  console.log("--- 1. Testing Business Context System ---");

  const initialContext = await businessContextService.getBusinessContext();
  assert(initialContext !== null, "Initial context is retrieved without crashing");
  assert(typeof initialContext.business === "object", "Context has business section");
  assert(typeof initialContext.audience === "object", "Context has audience section");
  assert(typeof initialContext.offer === "object", "Context has offer section");
  assert(typeof initialContext.marketing === "object", "Context has marketing section");

  // Validation: Whitespace only business name should fail
  const invalidNameValidation = businessContextService.validate({
    business: { businessName: "    " },
  });
  assert(invalidNameValidation.isValid === false, "Whitespace-only business name is rejected");

  // Save valid context
  const testPayload = {
    business: {
      businessName: "CashierPro POS",
      businessDescription: "نظام كاشير ونقاط بيع متكامل للمطاعم والسوبرماركت.",
      productService: "برنامج كاشير سحابي متطور",
      industry: "Retail & F&B Software",
    },
    audience: {
      targetAudience: "أصحاب المحلات التجارية والمطاعم والكافيهات",
      customerProblems: "صعوبة جرد المخزون، والسرقات، وبطء الكاشير وقت الذروة",
    },
    offer: {
      mainOffer: "اشتراك سنوي مع جهاز كاشير وطابعة فواتير مجاناً",
      pricing: "يبدأ من 5000 ج.م سنوياً",
      competitiveAdvantages: "دعم فني 24/7، يعمل بدون إنترنت، وربط الفاتورة الإلكترونية",
      primaryCta: "احجز نسختك التجريبية المجانية",
    },
    marketing: {
      mainMarketingGoal: "زيادة العملاء المحتملين وتوليد 100 طلب تجربة شهرياً",
      secondaryGoals: "بناء الوعي بالعلامة التجارية على تيك توك",
      brandTone: "احترافي، عملي، وموثوق",
      contentPillars: "شروحات كاشير، قصص نجاح تجار، نصائح لزيادة الأرباح",
      currentCampaigns: "حملة موسم الصيف 2026",
      currentOffers: "خصم 20% للعملاء الجدد",
      importantNotes: "التركيز على سرعة النظام وسهولة تدريب الموظفين",
    },
  };

  const saved = await businessContextService.updateBusinessContext(testPayload);
  assert(saved.business.businessName === "CashierPro POS", "Business name saved correctly");
  assert(businessContextService.isConfigured(saved) === true, "isConfigured returns true for populated context");

  // Verify persistence
  const reloaded = await businessContextService.getBusinessContext();
  assert(reloaded.business.businessName === "CashierPro POS", "Saved context persists on reload");
  assert(reloaded.marketing.mainMarketingGoal.includes("100 طلب"), "Marketing goals persisted accurately");

  // ----------------------------------------------------
  // TEST GROUP 2: Marketing Analytics Engine
  // ----------------------------------------------------
  console.log("\n--- 2. Testing Marketing Analytics Engine ---");

  // Empty Catalog Case
  const emptyAnalytics = marketingAnalyticsEngine.calculateAnalytics([], { period: "all" });
  assert(emptyAnalytics.content.totalVideosInCatalog === 0, "Empty catalog returns 0 total videos");
  assert(emptyAnalytics.views.total === 0, "Empty catalog returns 0 views");
  assert(emptyAnalytics.engagement.rate === null, "Empty catalog returns null engagement rate (no NaN/Infinity)");
  assert(emptyAnalytics.dataQuality.status === "insufficient_data", "Empty catalog reports insufficient_data");
  assert(emptyAnalytics.posting.status === "insufficient_data", "Empty catalog posting frequency reports insufficient_data");

  // Real Test Dataset
  const now = new Date("2026-08-20T12:00:00Z");
  const testVideos = [
    {
      id: "vid_001",
      title: "كيف توقف سرقات الكاشير في 3 خطوات",
      publishTime: new Date("2026-08-18T10:00:00Z").getTime(), // 2 days ago
      metrics: {
        views: 10000,
        likes: 500,
        comments: 50,
        shares: 50,
      },
    },
    {
      id: "vid_002",
      title: "أسرع جهاز كاشير لمطاعم الفاست فود",
      publishTime: new Date("2026-08-10T10:00:00Z").getTime(), // 10 days ago
      metrics: {
        views: 20000,
        likes: 800,
        comments: 100,
        shares: 100,
      },
    },
    {
      id: "vid_003",
      title: "شرح الفاتورة الإلكترونية مع كاشير برو",
      publishTime: new Date("2026-07-01T10:00:00Z").getTime(), // 50 days ago
      metrics: {
        views: 5000,
        likes: 200,
        comments: 20,
        shares: 30,
      },
    },
  ];

  // Test "all" period calculations
  const allResult = marketingAnalyticsEngine.calculateAnalytics(testVideos, { period: "all", now });
  assert(allResult.content.totalVideosInCatalog === 3, "Catalog count is 3");
  assert(allResult.views.total === 35000, "Total views is 35,000 (10000 + 20000 + 5000)");
  assert(allResult.views.average === 11667, "Average views per video is Math.round(35000 / 3) = 11667");
  assert(allResult.likes.total === 1500, "Total likes is 1,500");
  assert(allResult.comments.total === 170, "Total comments is 170");
  assert(allResult.shares.total === 180, "Total shares is 180");

  // Engagement Rate Test: (1500 + 170 + 180) / 35000 * 100 = 1850 / 35000 * 100 = 5.29%
  const expectedRate = Number(((1850 / 35000) * 100).toFixed(2)); // 5.29
  assert(allResult.engagement.rate === expectedRate, `Engagement rate is exactly ${expectedRate}%`);
  assert(allResult.engagement.rateFormatted === "5.29%", "Formatted rate is 5.29%");

  // Ranking Tests
  assert(allResult.rankings.byViews[0].id === "vid_002", "Top video by views is vid_002 (20,000 views)");
  assert(allResult.rankings.byViews[1].id === "vid_001", "Second video by views is vid_001 (10,000 views)");
  assert(allResult.rankings.byEngagement[0].id === "vid_001", "Top video by engagement rate is vid_001 (6.0%)");

  // Zero-views video safeguard
  const zeroViewsVideo = [
    {
      id: "vid_zero",
      title: "فيديو بدون مشاهدات",
      publishTime: Date.now(),
      metrics: { views: 0, likes: 0, comments: 0, shares: 0 },
    },
  ];
  const zeroResult = marketingAnalyticsEngine.calculateAnalytics(zeroViewsVideo, { period: "all", now });
  assert(zeroResult.engagement.rate === null, "Zero views produces null engagement rate instead of NaN");

  // Time Period Filter Test: 7d window (should include only vid_001)
  const p7dResult = marketingAnalyticsEngine.calculateAnalytics(testVideos, { period: TIME_PERIODS.P7D, now });
  assert(p7dResult.content.videosPublishedInPeriod === 1, "7d period has exactly 1 video");
  assert(p7dResult.views.total === 10000, "7d views total is 10,000");

  // Time Period Filter Test: 30d window (should include vid_001 and vid_002)
  const p30dResult = marketingAnalyticsEngine.calculateAnalytics(testVideos, { period: TIME_PERIODS.P30D, now });
  assert(p30dResult.content.videosPublishedInPeriod === 2, "30d period has exactly 2 videos");
  assert(p30dResult.views.total === 30000, "30d views total is 30,000");

  // Posting Cadence Test
  assert(allResult.posting.status === "calculated", "Posting cadence status is calculated");
  assert(typeof allResult.posting.averageVideosPerWeek === "number", "averageVideosPerWeek is a number");
  assert(typeof allResult.posting.averageDaysBetweenPosts === "number", "averageDaysBetweenPosts is a number");

  // Data Quality Test
  assert(allResult.dataQuality.status === "complete", "Data quality with all 4 metrics is complete");

  const partialVideos = [
    {
      id: "vid_p1",
      title: "فيديو بدون مشاركات",
      publishTime: Date.now(),
      metrics: { views: 100, likes: 10, comments: 2 }, // Missing shares
    },
  ];
  const partialResult = marketingAnalyticsEngine.calculateAnalytics(partialVideos, { period: "all", now });
  assert(partialResult.dataQuality.status === "partial", "Missing metric identified as partial data quality");
  assert(partialResult.dataQuality.missingMetrics.includes("shares"), "Identifies shares as missing metric");

  // ----------------------------------------------------
  // TEST GROUP 3: AI Context Boundary
  // ----------------------------------------------------
  console.log("\n--- 3. Testing Future AI Context Boundary ---");

  const aiContext = await aiContextService.getMarketingContext({ period: "30d" });
  assert(aiContext !== null, "AI context assembled successfully");
  assert(aiContext.business.isConfigured === true, "AI context recognizes configured business");
  assert(aiContext.business.name === "CashierPro POS", "AI context includes correct business name");
  assert(aiContext.marketingGoals.primary.includes("100 طلب"), "AI context includes primary marketing goal");
  assert(typeof aiContext.analyticsSummary === "object", "AI context includes deterministic analytics summary");

  console.log("\n==================================================");
  console.log(`  PHASE 3A RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite runtime error:", err);
  process.exit(1);
});
