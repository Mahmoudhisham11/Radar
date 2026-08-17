"use client";

import styles from "./AttentionBanner.module.css";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function AttentionBanner({
  severity = "critical", // critical, warning, opportunity, reminder
  title,
  message,
  actionLabel,
  onAction,
}) {
  const getBadgeVariant = () => {
    switch (severity) {
      case "critical": return "danger";
      case "warning": return "warning";
      case "opportunity": return "accent";
      case "reminder": return "purple";
      default: return "default";
    }
  };

  return (
    <div className={`${styles.banner} ${styles[severity] || styles.critical}`}>
      <div className={styles.left}>
        <Badge variant={getBadgeVariant()} size="sm" dot>
          {severity}
        </Badge>
        <div className={styles.textContainer}>
          <span className={styles.title}>{title}</span>
          <span className={styles.message}>{message}</span>
        </div>
      </div>
      {actionLabel && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
