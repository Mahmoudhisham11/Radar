import styles from "./GoalProgress.module.css";
import Badge from "@/components/ui/Badge/Badge";

export default function GoalProgress({
  title,
  current = 0,
  target = 100,
  unit = "",
  status = "on_track", // ahead, on_track, at_risk, behind
  paceRecommendation = "",
  deadline = "",
}) {
  const percentage = Math.min(Math.round((current / (target || 1)) * 100), 100);

  const getStatusBadge = () => {
    switch (status) {
      case "ahead": return { variant: "success", label: "Ahead" };
      case "on_track": return { variant: "accent", label: "On Track" };
      case "at_risk": return { variant: "warning", label: "At Risk" };
      case "behind": return { variant: "danger", label: "Behind" };
      default: return { variant: "default", label: status };
    }
  };

  const badgeInfo = getStatusBadge();

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div>
          <h4 className={styles.title}>{title}</h4>
          {deadline && <span className={styles.deadline}>Target: {deadline}</span>}
        </div>
        <Badge variant={badgeInfo.variant} size="sm">
          {badgeInfo.label}
        </Badge>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.numbersRow}>
          <span className={styles.current}>{current} {unit}</span>
          <span className={styles.target}>Target: {target} {unit} ({percentage}%)</span>
        </div>
        <div className={styles.progressBarBg}>
          <div
            className={`${styles.progressBarFill} ${styles[status]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {paceRecommendation && (
        <div className={styles.paceNote}>
          <span className={styles.paceLabel}>Required Pace:</span> {paceRecommendation}
        </div>
      )}
    </div>
  );
}
