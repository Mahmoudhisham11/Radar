"use client";

import styles from "./intelligence.module.css";
import Header from "@/components/layout/Header/Header";
import InsightCard from "@/components/radar/InsightCard/InsightCard";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import { useMarketingAnalytics } from "@/lib/hooks/useMarketingAnalytics";

export default function IntelligencePage() {
  const { analytics, loading } = useMarketingAnalytics("all");

  const topVideo = analytics?.rankings?.byViews?.[0] || null;
  const totalVideos = analytics?.content?.totalVideosInCatalog || 0;

  return (
    <div className={styles.page}>
      <Header
        title="مركز الذكاء التسويقي"
        subtitle="محرك تحويل البيانات الحقيقية → ذكاء استراتيجي → قرارات نمو"
      />

      <div className={styles.content}>
        <div className={styles.headerInfo}>
          <div className={styles.philosophyBox}>
            <span className={styles.philosophyLabel}>مبدأ رادار الصارم:</span>
            <span className={styles.philosophyText}>
              البيانات الحقيقية والمحرك الحسابي المباشر هما الأساس الوحيد لاتخاذ أي قرار تسويقي (Zero Mock Data).
            </span>
          </div>
          <div className={styles.stats}>
            <Badge variant="accent" size="md">
              {topVideo ? "1 مؤشر أداء بارز" : "0 مؤشرات"}
            </Badge>
            <Badge variant="success" size="md">0 مشكلات حرجة</Badge>
          </div>
        </div>

        {totalVideos === 0 && !loading ? (
          <div className={styles.emptyState}>
            <p>لا توجد بيانات كافية مستخرجة حتى الآن.</p>
            <p>قم بمزامنة فيديوهات حساب تيك توك لتوليد الرؤى والتحليلات الرياضية بدقة.</p>
          </div>
        ) : (
          <div className={styles.sectionGrid}>
            {/* Opportunities Section backed by Deterministic Analytics */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.opportunityDot} />
                مؤشرات النمو المرتكزة على البيانات الرياضية
              </h3>
              <div className={styles.cardList}>
                {topVideo && (
                  <InsightCard
                    type="opportunity"
                    severity="info"
                    title={`المقطع الأكثر وصولاً: ${topVideo.title || "فيديو تيك توك"}`}
                    summary={`حقق هذا المقطع أعلى وصول بين محتوى القناة بإجمالي ${(topVideo.views || 0).toLocaleString()} مشاهدة و ${(topVideo.likes || 0).toLocaleString()} إعجاب ومعدل تفاعل ${topVideo.engagementRate !== null ? topVideo.engagementRate + "%" : "غير متوفر"}.`}
                    evidence={[
                      { metric: "المشاهدات", change: `${(topVideo.views || 0).toLocaleString()}`, period: "فيديو فردي" },
                      { metric: "الإعجابات", change: `${(topVideo.likes || 0).toLocaleString()}`, period: "تفاعل مباشر" },
                      { metric: "معدل التفاعل", change: `${topVideo.engagementRate !== null ? topVideo.engagementRate + "%" : "غير متوفر"}`, period: "حساب دقيق" },
                    ]}
                    recommendedActions={[
                      { action: "تحليل الموضوع الرئيسي للمقطع وإعادة صياغته في أفكار محتوى جديدة." },
                    ]}
                  />
                )}
              </div>
            </div>

            {/* Preparation for Future AI Intelligence Engine */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.problemDot} />
                محرك الذكاء والاستدلال المتقدم (AI Intelligence)
              </h3>
              <div className={styles.cardList}>
                <Card
                  title="الاستدلال الذكي التوليدي"
                  subtitle="مرحلة الربط والاستدلال المتقدم (Phase 3B)"
                >
                  <div style={{ padding: "8px 0", fontSize: "13px", color: "var(--radar-text-secondary)", lineHeight: "1.6" }}>
                    تم بناء وتجهيز <strong>سياق النشاط التجاري (Business Context)</strong> و<strong>محرك التحليلات الحسابية (Analytics Engine)</strong> بنجاح. ستكون التوصيات والاستدلالات التلقائية المتقدمة للذكاء الاصطناعي متاحة عند تفعيل مرحلة محرك الاستدلال الذكي القادمة.
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
