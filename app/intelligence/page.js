import styles from "./intelligence.module.css";
import Header from "@/components/layout/Header/Header";
import InsightCard from "@/components/radar/InsightCard/InsightCard";
import Badge from "@/components/ui/Badge/Badge";

export default function IntelligencePage() {
  return (
    <div className={styles.page}>
      <Header
        title="مركز الذكاء التسويقي"
        subtitle="محرك تحويل البيانات → ذكاء → قرارات → إجراءات عملية"
      />

      <div className={styles.content}>
        <div className={styles.headerInfo}>
          <div className={styles.philosophyBox}>
            <span className={styles.philosophyLabel}>جوهر الذكاء:</span>
            <span className={styles.philosophyText}>
              كل توصية مبنية على بيانات واقعية ودقيقة من حركة التسويق والتفاعل.
            </span>
          </div>
          <div className={styles.stats}>
            <Badge variant="danger" size="md">2 مشكلات</Badge>
            <Badge variant="accent" size="md">3 فرص للنمو</Badge>
            <Badge variant="purple" size="md">2 اتجاهات</Badge>
          </div>
        </div>

        <div className={styles.sectionGrid}>
          {/* Problems */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.problemDot} />
              مشكلات تتطلب انتباهك الفوري
            </h3>
            <div className={styles.cardList}>
              <InsightCard
                type="problem"
                severity="critical"
                title="تأخر في تحويل المهتمين إلى عروض تجريبية (Demos)"
                summary="العملاء القادمون من آخر 3 فيديوهات انخفض معدل حجز العروض بنسبة 15% بسبب التأخر في المتابعة."
                evidence={[
                  { metric: "معدل التحويل", change: "15%-", period: "آخر 7 أيام" },
                  { metric: "متوسط وقت الرد", change: "14.2 ساعة", period: "المستهدف: أقل من ساعتين" }
                ]}
                recommendedActions={[
                  { action: "التواصل الفوري مع 4 عملاء مهتمين في قائمة الانتظار." }
                ]}
              />

              <InsightCard
                type="problem"
                severity="warning"
                title="تحذير تسرب عملاء قطاع السوبرماركت"
                summary="حسابات محلات السوبرماركت تظهر انخفاضاً بنسبة 28% في جلسات الكاشير النشطة خلال آخر 3 أسابيع."
                evidence={[
                  { metric: "حجم الجلسات", change: "28%-", period: "آخر 21 يوم" },
                  { metric: "العملاء المتأثرين", change: "3 متاجر تجارية", period: "قطاع البقالة" }
                ]}
                recommendedActions={[
                  { action: "إجراء اتصال متابعة لخدمة ودعم عملاء السوبرماركت وتقديم تدريب إضافي." }
                ]}
              />
            </div>
          </div>

          {/* Opportunities */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.opportunityDot} />
              فرص ذهبية لتسريع النمو
            </h3>
            <div className={styles.cardList}>
              <InsightCard
                type="opportunity"
                severity="info"
                title="فيديو عالي التأثير: 'كشف عجز درج الكاشير'"
                summary="الفيديو القصير حول مطابقة نوبات الكاشير حقق 3.1 ضعف متوسط الاستفسارات والرسائل الواردة."
                evidence={[
                  { metric: "معدل التفاعل", change: "7.8%", period: "المعدل العام: 3.2%" },
                  { metric: "الرسائل المباشرة", change: "14+ عميل مهتم", period: "من فيديو واحد" }
                ]}
                recommendedActions={[
                  { action: "كتابة وتصوير نسختين جديدتين تركزان على حماية الأرباح وتفادي العجز اليومي." }
                ]}
              />

              <InsightCard
                type="opportunity"
                severity="info"
                title="تسارع الطلب من قطاع المطاعم والكافيهات"
                summary="ارتفعت الاستفسارات من أصحاب الكافيهات ذات الفروع المتعددة بنسبة 40% بعد استعراض ميزة مزامنة المخزون."
                evidence={[
                  { metric: "استفسارات الكافيهات", change: "40%+", period: "آخر 14 يوم" }
                ]}
                recommendedActions={[
                  { action: "نشر دراسة حالة مخصصة تبرز سهولة إدارة الفروع المتعددة بنقرة واحدة." }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
