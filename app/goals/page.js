"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./goals.module.css";
import Header from "@/components/layout/Header/Header";
import GoalProgress from "@/components/radar/GoalProgress/GoalProgress";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import { useMarketingAnalytics } from "@/lib/hooks/useMarketingAnalytics";

export default function GoalsPage() {
  const { analytics, loading: analyticsLoading } = useMarketingAnalytics("all");
  const [bizContext, setBizContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);

  useEffect(() => {
    async function loadBizContext() {
      try {
        const res = await fetch("/api/business-context");
        if (res.ok) {
          const data = await res.json();
          setBizContext(data.context);
        }
      } catch (err) {
        console.error("Failed to load business context in goals page:", err);
      } finally {
        setContextLoading(false);
      }
    }
    loadBizContext();
  }, []);

  const totalVideos = analytics?.content?.totalVideosInCatalog || 0;
  const mainGoal = bizContext?.marketing?.mainMarketingGoal?.trim();
  const secondaryGoals = bizContext?.marketing?.secondaryGoals?.trim();

  return (
    <div className={styles.page}>
      <Header
        title="محرك الأهداف ووتيرة التنفيذ"
        subtitle="متابعة الأداء الرياضي الفعلي مقابل الأهداف الاستراتيجية المحددة في سياق النشاط"
        actions={
          <Link href="/settings">
            <Button variant="primary" size="sm">
              ⚙️ تهيئة الأهداف في الإعدادات
            </Button>
          </Link>
        }
      />

      <div className={styles.content}>
        {/* Main Strategic Goal from Business Context */}
        {mainGoal ? (
          <Card
            title="الهدف التسويقي الرئيسي المحدد"
            subtitle="مستخرج من سياق النشاط التجاري (Business Context)"
          >
            <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Badge variant="accent" size="sm">الهدف الأساسي</Badge>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--radar-text-primary)" }}>
                  {mainGoal}
                </span>
              </div>
              {secondaryGoals && (
                <div style={{ fontSize: "12px", color: "var(--radar-text-secondary)", marginTop: "4px" }}>
                  <strong>أهداف مكملة:</strong> {secondaryGoals}
                </div>
              )}
            </div>
          </Card>
        ) : !contextLoading && (
          <div className={styles.emptyState}>
            <p>لم يتم تهيئة هدف تسويقي رئيسي في سياق النشاط التجاري بعد.</p>
            <p>يمكنك تحديد هدفك التسويقي ونبرة المحتوى في صفحة الإعدادات لتتبع وتيرة الإنجاز بدقة.</p>
            <div style={{ marginTop: "12px" }}>
              <Link href="/settings">
                <Button variant="primary" size="sm">
                  تهيئة الأهداف الآن
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Content Cadence & Publication Goal */}
        <div className={styles.goalsGrid}>
          <GoalProgress
            title="وتيرة نشر ومزامنة فيديوهات تيك توك"
            current={totalVideos}
            target={20}
            unit="فيديو"
            status={totalVideos >= 20 ? "ahead" : totalVideos > 0 ? "on_track" : "at_risk"}
            deadline="المستهدف الدوري"
            paceRecommendation={
              totalVideos > 0
                ? analytics?.posting?.status === "calculated"
                  ? `معدل النشر الحالي: ${analytics.posting.averageVideosPerWeek} مقطع/أسبوع.`
                  : `تم إنجاز ${totalVideos} مقطع حتى الآن.`
                : "قم بربط حساب تيك توك لحساب وتيرة النشر تلقائياً."
            }
          />
        </div>
      </div>
    </div>
  );
}
