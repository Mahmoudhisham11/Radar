"use client";

import styles from "./leads.module.css";
import Header from "@/components/layout/Header/Header";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";

const PIPELINE_STAGES = [
  { id: "new", name: "وارد جديد", count: 0 },
  { id: "contacted", name: "تم التواصل", count: 0 },
  { id: "interested", name: "مهتم", count: 0 },
  { id: "demo", name: "حجز عرض", count: 0 },
  { id: "negotiation", name: "مفاوضات", count: 0 },
  { id: "won", name: "تم الإغلاق", count: 0 },
];

export default function LeadsPage() {
  const leads = [];

  return (
    <div className={styles.page}>
      <Header
        title="إدارة العملاء المحتملين"
        subtitle="مسار متابعة واستقبال استفسارات الشراء وتحويلها لمبيعات"
        actions={
          <Button variant="primary" size="sm">
            + إضافة عميل محتمل
          </Button>
        }
      />

      <div className={styles.content}>
        {/* Pipeline Summary Bar */}
        <div className={styles.pipelineBar}>
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className={styles.stageCard}>
              <span className={styles.stageName}>{stage.name}</span>
              <span className={styles.stageCount}>{stage.count}</span>
            </div>
          ))}
        </div>

        {/* Lead Details */}
        <Card
          title="قائمة العملاء المحتملين والمهتمين"
          subtitle="متابعة الاستفسارات الواردة وفق الأولوية وسرعة الرد"
        >
          {leads.length === 0 ? (
            <div className={styles.emptyState}>
              <p>لا يوجد عملاء محتملون في قائمة الانتظار حالياً.</p>
              <p>يتم تسجيل العملاء تلقائياً عند تفاعلهم واستفسارهم من خلال التعليقات أو النماذج المتصلة.</p>
            </div>
          ) : (
            <div className={styles.leadList}>
              {leads.map((lead) => (
                <div key={lead.id} className={styles.leadItem}>
                  {/* Real lead details */}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
