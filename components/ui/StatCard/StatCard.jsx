import styles from "./StatCard.module.css";
import Badge from "../Badge/Badge";

export default function StatCard({
  label,
  value,
  change,
  changeType = "neutral", // positive, negative, neutral
  period = "vs last week",
  icon,
  prefix = "",
  suffix = "",
}) {
  const getChangeBadgeVariant = () => {
    if (changeType === "positive") return "success";
    if (changeType === "negative") return "danger";
    return "default";
  };

  return (
    <div className={styles.statCard}>
      <div className={styles.topRow}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>

      <div className={styles.valueRow}>
        <span className={styles.prefix}>{prefix}</span>
        <span className={styles.value}>{value}</span>
        <span className={styles.suffix}>{suffix}</span>
      </div>

      {(change || period) && (
        <div className={styles.bottomRow}>
          {change && (
            <Badge variant={getChangeBadgeVariant()} size="sm">
              {changeType === "positive" ? "+" : ""}{change}
            </Badge>
          )}
          {period && <span className={styles.period}>{period}</span>}
        </div>
      )}
    </div>
  );
}
