"use client";

import styles from "./page.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import InsightCard from "@/components/radar/InsightCard/InsightCard";
import AttentionBanner from "@/components/radar/AttentionBanner/AttentionBanner";
import GoalProgress from "@/components/radar/GoalProgress/GoalProgress";
import SystemHealth from "@/components/radar/SystemHealth/SystemHealth";
import { useTikTokVideos } from "@/lib/hooks/useTikTokRealtime";

export default function CommandCenterPage() {
  const { videos, loading: videosLoading } = useTikTokVideos();

  const totalTikTokViews = videos.reduce((sum, v) => sum + (v.metrics?.views || 0), 0);
  const totalTikTokLikes = videos.reduce((sum, v) => sum + (v.metrics?.likes || 0), 0);

  return (
    <div className={styles.page}>
      <Header
        title="مركز القيادة"
        subtitle="نظرة عامة على أداء التسويق ونمو الأعمال المباشر"
      />

      <div className={styles.content}>
        {/* Attention Center Banner */}
        <section className={styles.attentionSection}>
          <AttentionBanner
            severity="critical"
            title="متابعة عاجلة للعملاء المحتملين ذوي الاهتمام العالي"
            message="هناك 4 عملاء مهتمين من فيديوهات نقاط البيع الأخيرة لم تتم متابعتهم منذ أكثر من 48 ساعة."
            actionLabel="عرض العملاء"
          />
        </section>

        {/* Key Performance Metrics */}
        <section className={styles.metricsGrid}>
          <StatCard
            label="الإيرادات الشهرية"
            prefix="ج.م "
            value="142,500"
            change="18.4%+"
            changeType="positive"
            period="مقارنة بالشهر السابق"
          />
          <StatCard
            label="العملاء النشطين"
            value="84"
            change="6+"
            changeType="positive"
            period="عملاء جدد هذا الشهر"
          />
          <StatCard
            label="مشاهدات تيك توك (مباشر)"
            value={videosLoading ? "..." : totalTikTokViews.toLocaleString()}
            change={videos.length > 0 ? `${videos.length} فيديو` : "لا توجد بيانات"}
            changeType="positive"
            period="مزامنة فورية من الحساب"
          />
          <StatCard
            label="إعجابات تيك توك (مباشر)"
            value={videosLoading ? "..." : totalTikTokLikes.toLocaleString()}
            change="❤️ تفاعل حقيقي"
            changeType="positive"
            period="تفاعل الجمهور المباشر"
          />
        </section>

        {/* Main Intelligence & Goals Grid */}
        <div className={styles.twoColumnGrid}>
          {/* Left Column: AI Intelligence & Insights */}
          <div className={styles.column}>
            <Card
              title="ذكاء رادار التسويقي"
              subtitle="تحليلات الفرص والمشكلات وإشارات اتخاذ القرار"
            >
              <div className={styles.insightsList}>
                <InsightCard
                  type="opportunity"
                  severity="info"
                  title="معدل استكمال الفيديوهات أعلى من المتوسط"
                  summary="الفيديوهات التي توضح مشكلة هدر المخزون في محلات البقالة حققت معدل استكمال أعلى بـ 2.4 ضعف."
                  evidence={[
                    { metric: "الفيديوهات المتابعة", change: `${videos.length} فيديو`, period: "مزامنة تيك توك" },
                    { metric: "إجمالي التفاعل", change: `${totalTikTokLikes} إعجاب`, period: "إحصائية مباشرة" }
                  ]}
                  recommendedActions={[
                    { action: "إنشاء 3 نصوص تسويقية جديدة تركز على حل مشكلة عجز المخزون وسرعة الكاشير." }
                  ]}
                />

                <InsightCard
                  type="problem"
                  severity="critical"
                  title="عائق في تحويل المهتمين إلى عروض تجريبية (Demos)"
                  summary="زيادة عدد العملاء المهتمين بنسبة 22% ولكن معدل حجز العروض انخفض بسبب التأخر في الرد الأولي."
                  evidence={[
                    { metric: "متوسط وقت الرد", change: "14.2 ساعة", period: "المستهدف: أقل من ساعتين" },
                    { metric: "معدل التحويل", change: "15%-", period: "مقارنة بالأسبوع الماضي" }
                  ]}
                  recommendedActions={[
                    { action: "مراجعة نظام الردود السريعة وإرسال رسائل متابعة فورية للمهتمين الجدد." }
                  ]}
                />
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
                  title="30 عميل جديد مشترك"
                  current={18}
                  target={30}
                  unit="عميل"
                  status="on_track"
                  deadline="نهاية الشهر الحالي"
                  paceRecommendation="يتطلب كسب 3 عملاء جدد أسبوعياً لتحقيق الهدف."
                />
                <GoalProgress
                  title="نشر فيديوهات تيك توك عالية التأثير"
                  current={videos.length}
                  target={25}
                  unit="فيديو"
                  status={videos.length >= 25 ? "ahead" : "on_track"}
                  deadline="الهدف الشهري"
                  paceRecommendation="معدل النشر متوافق مع الخطة الشهرية."
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
