"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import InsightCard from "@/components/radar/InsightCard/InsightCard";
import AttentionBanner from "@/components/radar/AttentionBanner/AttentionBanner";
import GoalProgress from "@/components/radar/GoalProgress/GoalProgress";
import SystemHealth from "@/components/radar/SystemHealth/SystemHealth";
import { useMarketingAnalytics } from "@/lib/hooks/useMarketingAnalytics";

export default function CommandCenterPage() {
  const { analytics, loading: analyticsLoading } = useMarketingAnalytics("all");
  const [unrepliedComments, setUnrepliedComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/comments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const pending = (data.comments || []).filter((c) => !c.replied);
        setUnrepliedComments(pending);
      }
    } catch (err) {
      console.error("Failed to fetch comments in dashboard:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
    const handleUpdate = () => fetchComments();
    window.addEventListener("radar:comments_updated", handleUpdate);
    return () => {
      window.removeEventListener("radar:comments_updated", handleUpdate);
    };
  }, [fetchComments]);

  const handleMarkReplied = async (commentId) => {
    try {
      const res = await fetch("/api/integrations/tiktok/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, action: "mark_replied" }),
      });
      if (res.ok) {
        setUnrepliedComments((prev) => prev.filter((c) => c.id !== commentId));
        window.dispatchEvent(new CustomEvent("radar:comments_updated"));
      }
    } catch (err) {
      console.error("Failed to mark comment as replied:", err);
    }
  };

  const topVideo = analytics?.rankings?.byViews?.[0] || null;
  const totalVideos = analytics?.content?.totalVideosInCatalog || 0;
  const totalViews = analytics?.views?.total || 0;
  const totalLikes = analytics?.likes?.total || 0;
  const engagementRateFormatted = analytics?.engagement?.rateFormatted || "0%";

  return (
    <div className={styles.page}>
      <Header
        title="مركز القيادة"
        subtitle="نظرة عامة على أداء التسويق ونمو الأعمال المباشر"
      />

      <div className={styles.content}>
        {/* Attention Center Banner - Real Alerts Only */}
        <section className={styles.attentionSection}>
          {unrepliedComments.length > 0 ? (
            <AttentionBanner
              severity="critical"
              title={`هناك ${unrepliedComments.length} استفسار / تعليق غير معالج من العملاء`}
              message={`أحدث تعليق من ${unrepliedComments[0].authorName}: "${unrepliedComments[0].text}"`}
              actionLabel="معالجة التعليقات"
              onAction={() => handleMarkReplied(unrepliedComments[0].id)}
            />
          ) : (
            <AttentionBanner
              severity="success"
              title="جميع العمليات والردود مكتملة ومحدثة"
              message="لا توجد تنبيهات حرجة معلقة حالياً. يتم تحديث التفاعلات والمزامنة بصورة مستمرة."
            />
          )}
        </section>

        {/* Real Live Metrics from Deterministic Analytics Engine */}
        <section className={styles.metricsGrid}>
          <StatCard
            label="فيديوهات تيك توك (مباشر)"
            value={analyticsLoading ? "..." : `${totalVideos}`}
            change={totalVideos > 0 ? "متزامن بنجاح" : "لا توجد فيديوهات"}
            changeType={totalVideos > 0 ? "positive" : "neutral"}
            period="مزامنة فورية من الحساب"
          />
          <StatCard
            label="إجمالي المشاهدات"
            value={analyticsLoading ? "..." : totalViews.toLocaleString()}
            change={totalVideos > 0 ? `${totalVideos} فيديو` : "0"}
            changeType="positive"
            period="إحصائية القناة الفعلية"
          />
          <StatCard
            label="معدل التفاعل الإجمالي"
            value={analyticsLoading ? "..." : engagementRateFormatted}
            change={`❤️ ${totalLikes.toLocaleString()} إعجاب`}
            changeType="positive"
            period="محسوب بدقة من التفاعلات"
          />
          <StatCard
            label="التعليقات في انتظار الرد"
            value={commentsLoading ? "..." : `${unrepliedComments.length}`}
            change={unrepliedComments.length > 0 ? "تتطلب المتابعة" : "تم الرد بالكامل ✓"}
            changeType={unrepliedComments.length > 0 ? "negative" : "positive"}
            period="إشعارات العملاء الواردة"
          />
        </section>

        {/* Main Intelligence & Goals Grid */}
        <div className={styles.twoColumnGrid}>
          {/* Left Column: AI Intelligence & Insights (Built on Deterministic Analytics Engine) */}
          <div className={styles.column}>
            <Card
              title="ذكاء رادار التسويقي"
              subtitle="تحليلات الفرص وإشارات اتخاذ القرار من البيانات الفعلية"
            >
              <div className={styles.insightsList}>
                {topVideo ? (
                  <InsightCard
                    type="opportunity"
                    severity="info"
                    title={`الفيديو الأعلى أداءً: ${topVideo.title || "فيديو تيك توك"}`}
                    summary={`حقق هذا الفيديو أعلى تفاعل بين فيديوهات القناة بإجمالي ${(topVideo.views || 0).toLocaleString()} مشاهدة و ${(topVideo.likes || 0).toLocaleString()} إعجاب.`}
                    evidence={[
                      { metric: "المشاهدات", change: `${(topVideo.views || 0).toLocaleString()}`, period: "فيديو فردي" },
                      { metric: "الإعجابات", change: `${(topVideo.likes || 0).toLocaleString()}`, period: "تفاعل مباشر" },
                      { metric: "معدل التفاعل", change: `${topVideo.engagementRate !== null ? topVideo.engagementRate + "%" : "غير متوفر"}`, period: "معدل تفاعل المقطع" }
                    ]}
                    recommendedActions={[
                      { action: "إنشاء أفكار محتوى وفيديوهات جديدة تتبع نفس الأسلوب وزاوية التقديم." }
                    ]}
                  />
                ) : (
                  <div className={styles.emptyState}>
                    بانتظار مزامنة فيديوهات تيك توك لحسابك لتوليد الرؤى والتحليلات التسويقية المباشرة.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Goal Engine & System Health */}
          <div className={styles.column}>
            <Card
              title="الأهداف النشطة والمسار"
              subtitle="متابعة مستمرة بين الأهداف المخططة والواقع الفعلي"
            >
              <div className={styles.goalsList}>
                <GoalProgress
                  title="نشر ومزامنة فيديوهات تيك توك"
                  current={totalVideos}
                  target={20}
                  unit="فيديو"
                  status={totalVideos >= 20 ? "ahead" : totalVideos > 0 ? "on_track" : "at_risk"}
                  deadline="الهدف الدوري"
                  paceRecommendation={
                    totalVideos > 0
                      ? analytics?.posting?.averageVideosPerWeek
                        ? `معدل النشر الحالي: ${analytics.posting.averageVideosPerWeek} فيديو/أسبوع.`
                        : `تمت مزامنة ${totalVideos} فيديو بنجاح حتى الآن.`
                      : "قم بربط حساب تيك توك لمزامنة الفيديوهات وتحقيق هدف النشر."
                  }
                />
              </div>
            </Card>

            <SystemHealth />
          </div>
        </div>
      </div>
    </div>
  );
}
