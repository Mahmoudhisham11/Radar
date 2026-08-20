"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./content.module.css";
import Header from "@/components/layout/Header/Header";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import StatCard from "@/components/ui/StatCard/StatCard";
import { useMarketingAnalytics } from "@/lib/hooks/useMarketingAnalytics";
import { TIME_PERIODS } from "@/lib/analytics/marketingAnalyticsEngine";

export default function ContentPage() {
  const { analytics, period, setPeriod, loading } = useMarketingAnalytics(TIME_PERIODS.ALL);
  const [rankingCriterion, setRankingCriterion] = useState("byViews"); // "byViews" | "byEngagement" | "byLikes" | "byComments" | "byShares"

  const rankedVideos = analytics?.rankings?.[rankingCriterion] || [];
  const totalVideosInPeriod = analytics?.content?.videosPublishedInPeriod || 0;

  return (
    <div className={styles.page}>
      <Header
        title="ذكاء وتحليلات المحتوى"
        subtitle="محرك تحليلي دقيق لترتيب وتقييم أداء الفيديوهات وتفاعل الجمهور الحقيقي"
        actions={
          <Link href="/tiktok">
            <Button variant="primary" size="sm">
              مزامنة تيك توك الآن 🔄
            </Button>
          </Link>
        }
      />

      <div className={styles.content}>
        {/* Analytics Filter Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>الفترة الزمنية:</span>
            <button
              type="button"
              className={`${styles.periodBtn} ${period === "7d" ? styles.active : ""}`}
              onClick={() => setPeriod("7d")}
            >
              آخر 7 أيام
            </button>
            <button
              type="button"
              className={`${styles.periodBtn} ${period === "30d" ? styles.active : ""}`}
              onClick={() => setPeriod("30d")}
            >
              آخر 30 يوم
            </button>
            <button
              type="button"
              className={`${styles.periodBtn} ${period === "90d" ? styles.active : ""}`}
              onClick={() => setPeriod("90d")}
            >
              آخر 90 يوم
            </button>
            <button
              type="button"
              className={`${styles.periodBtn} ${period === "all" ? styles.active : ""}`}
              onClick={() => setPeriod("all")}
            >
              جميع الفيديوهات
            </button>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>جودة البيانات:</span>
            {analytics?.dataQuality?.status === "complete" ? (
              <Badge variant="success" size="sm">بيانات مكتملة ✓</Badge>
            ) : analytics?.dataQuality?.status === "partial" ? (
              <Badge variant="warning" size="sm">بيانات جزئية</Badge>
            ) : (
              <Badge variant="default" size="sm">غير متوفرة</Badge>
            )}
          </div>
        </div>

        {/* Aggregate Overview for Period */}
        <div className={styles.metricsOverviewGrid}>
          <StatCard
            label="فيديوهات الفترة"
            value={loading ? "..." : `${totalVideosInPeriod}`}
            change={period === "all" ? "إجمالي القناة" : `خلال ${period}`}
            changeType="neutral"
            period="نطاق التقييم الحالي"
          />
          <StatCard
            label="مشاهدات الفترة"
            value={loading ? "..." : (analytics?.views?.total || 0).toLocaleString()}
            change={`متوسط: ${(analytics?.views?.average || 0).toLocaleString()} / فيديو`}
            changeType="positive"
            period="إجمالي المشاهدات"
          />
          <StatCard
            label="معدل التفاعل الإجمالي"
            value={loading ? "..." : (analytics?.engagement?.rateFormatted || "غير متوفر")}
            change={`إجمالي التفاعلات: ${(analytics?.engagement?.totalInteractions || 0).toLocaleString()}`}
            changeType="positive"
            period="نسبة الإعجاب والتعليق والمشاركة"
          />
          <StatCard
            label="وتيرة النشر"
            value={
              analytics?.posting?.status === "calculated"
                ? `${analytics.posting.averageVideosPerWeek} مقطع/أسبوع`
                : "بيانات غير كافية"
            }
            change={
              analytics?.posting?.status === "calculated"
                ? `بمعدل مقطع كل ${analytics.posting.averageDaysBetweenPosts} يوم`
                : "تتطلب مقطعين على الأقل"
            }
            changeType="neutral"
            period="سرعة نشر المحتوى"
          />
        </div>

        {totalVideosInPeriod === 0 && !loading ? (
          <div className={styles.emptyState}>
            <p>لا توجد فيديوهات منشورة في الفترة المحددة ({period}).</p>
            <p>قم باختيار فترة زمنية أخرى أو قم بمزامنة الفيديوهات من صفحة تيك توك.</p>
          </div>
        ) : (
          <div className={styles.twoColumnGrid}>
            {/* Left: Ranked Content List */}
            <Card
              title="تصنيف وترتيب الفيديوهات الحسابي"
              subtitle="مرتبة وفق المعيار الرياضي المختار"
            >
              {/* Ranking Criteria Tabs */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "16px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`${styles.rankBtn} ${rankingCriterion === "byViews" ? styles.active : ""}`}
                  onClick={() => setRankingCriterion("byViews")}
                >
                  👁️ الأعلى مشاهدة
                </button>
                <button
                  type="button"
                  className={`${styles.rankBtn} ${rankingCriterion === "byEngagement" ? styles.active : ""}`}
                  onClick={() => setRankingCriterion("byEngagement")}
                >
                  ⚡ الأعلى تفاعلاً %
                </button>
                <button
                  type="button"
                  className={`${styles.rankBtn} ${rankingCriterion === "byLikes" ? styles.active : ""}`}
                  onClick={() => setRankingCriterion("byLikes")}
                >
                  ❤️ الأكثر إعجاباً
                </button>
                <button
                  type="button"
                  className={`${styles.rankBtn} ${rankingCriterion === "byComments" ? styles.active : ""}`}
                  onClick={() => setRankingCriterion("byComments")}
                >
                  💬 الأكثر تعليقاً
                </button>
                <button
                  type="button"
                  className={`${styles.rankBtn} ${rankingCriterion === "byShares" ? styles.active : ""}`}
                  onClick={() => setRankingCriterion("byShares")}
                >
                  ↗️ الأكثر مشاركة
                </button>
              </div>

              <div className={styles.hookList}>
                {rankedVideos.slice(0, 10).map((video, idx) => (
                  <div key={video.id || idx} className={styles.hookItem}>
                    <div className={styles.hookHeader}>
                      <Badge variant={idx === 0 ? "accent" : idx === 1 ? "purple" : "default"} size="sm">
                        #{idx + 1} {video.title ? video.title.slice(0, 32) + "..." : "فيديو تيك توك"}
                      </Badge>
                      <span className={styles.hookScore}>
                        {rankingCriterion === "byEngagement"
                          ? `${video.engagementRate !== null ? video.engagementRate + "%" : "0%"}`
                          : rankingCriterion === "byLikes"
                          ? `${(video.likes || 0).toLocaleString()} إعجاب`
                          : rankingCriterion === "byComments"
                          ? `${(video.comments || 0).toLocaleString()} تعليق`
                          : rankingCriterion === "byShares"
                          ? `${(video.shares || 0).toLocaleString()} مشاركة`
                          : `${(video.views || 0).toLocaleString()} مشاهدة`}
                      </span>
                    </div>

                    <p className={styles.hookText}>&ldquo;{video.title || "بدون عنوان"}&rdquo;</p>

                    <div className={styles.hookStats}>
                      <span>👁️ {(video.views || 0).toLocaleString()} مشاهدة</span>
                      <span>❤️ {(video.likes || 0).toLocaleString()} إعجاب</span>
                      <span>💬 {(video.comments || 0).toLocaleString()} تعليق</span>
                      <span>↗️ {(video.shares || 0).toLocaleString()} مشاركة</span>
                      {video.engagementRate !== null && (
                        <span>⚡ {video.engagementRate}% تفاعل</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Right: Deterministic Content Benchmarks */}
            <Card
              title="مؤشرات أداء المحتوى"
              subtitle="استنتاجات حسابية مباشرة من أرقام القناة"
            >
              <div className={styles.recommendationList}>
                {analytics?.views?.highest && (
                  <div className={styles.recItem}>
                    <div className={styles.recHeader}>
                      <span className={styles.recTopic}>المقطع صاحب أعلى وصول (Top Reach)</span>
                      <Badge variant="accent" size="sm">{(analytics.views.highest.metrics?.views || 0).toLocaleString()} مشاهدة</Badge>
                    </div>
                    <p className={styles.recDescription}>
                      &ldquo;{analytics.views.highest.title || "مقطع تيك توك"}&rdquo;
                    </p>
                  </div>
                )}

                {analytics?.rankings?.byEngagement?.[0] && (
                  <div className={styles.recItem}>
                    <div className={styles.recHeader}>
                      <span className={styles.recTopic}>المقطع صاحب أعلى تفاعل نسبي (Top Engagement)</span>
                      <Badge variant="success" size="sm">{analytics.rankings.byEngagement[0].engagementRate}% تفاعل</Badge>
                    </div>
                    <p className={styles.recDescription}>
                      &ldquo;{analytics.rankings.byEngagement[0].title || "مقطع تيك توك"}&rdquo;
                    </p>
                  </div>
                )}

                <div className={styles.recItem}>
                  <div className={styles.recHeader}>
                    <span className={styles.recTopic}>تحليل متوسطات الفيديو في الفترة</span>
                    <Badge variant="purple" size="sm">إحصاء حسابي</Badge>
                  </div>
                  <p className={styles.recDescription}>
                    يحقق كل فيديو في المتوسط {(analytics?.views?.average || 0).toLocaleString()} مشاهدة و {(analytics?.likes?.average || 0).toLocaleString()} إعجاب و {(analytics?.comments?.average || 0).toLocaleString()} تعليق.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
