"use client";

import styles from "./InsightCard.module.css";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function InsightCard({
  type = "problem", // problem, opportunity, trend, recommendation
  severity = "warning",
  title,
  summary,
  evidence = [],
  recommendedActions = [],
  onTakeAction,
}) {
  const getTypeBadgeVariant = () => {
    switch (type) {
      case "problem": return { variant: "danger", label: "مشكلة" };
      case "opportunity": return { variant: "accent", label: "فرصة نمو" };
      case "trend": return { variant: "purple", label: "اتجاه صاعد" };
      case "recommendation": return { variant: "success", label: "توصية" };
      default: return { variant: "default", label: type };
    }
  };

  const badgeInfo = getTypeBadgeVariant();

  return (
    <div className={`${styles.card} ${styles[type] || styles.problem}`}>
      <div className={styles.header}>
        <div className={styles.badgeGroup}>
          <Badge variant={badgeInfo.variant} size="sm">
            {badgeInfo.label}
          </Badge>
          {severity === "critical" && (
            <Badge variant="danger" size="sm" dot>
              حرج
            </Badge>
          )}
        </div>
        <h4 className={styles.title}>{title}</h4>
      </div>

      <p className={styles.summary}>{summary}</p>

      {evidence.length > 0 && (
        <div className={styles.evidenceSection}>
          <span className={styles.sectionHeading}>الأدلة والبيانات الرقمية</span>
          <ul className={styles.evidenceList}>
            {evidence.map((item, idx) => (
              <li key={idx} className={styles.evidenceItem}>
                <span className={styles.evidenceMetric}>{item.metric}:</span>
                <span className={styles.evidenceValue}>{item.change || item.value}</span>
                {item.period && <span className={styles.evidencePeriod}>({item.period})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendedActions.length > 0 && (
        <div className={styles.actionSection}>
          <span className={styles.sectionHeading}>الخطوة التالية الموصى بها</span>
          <div className={styles.actionRow}>
            <span className={styles.actionText}>{recommendedActions[0].action || recommendedActions[0]}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTakeAction && onTakeAction(recommendedActions[0])}
            >
              تنفيذ الإجراء
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
