import styles from "./attention.module.css";
import Header from "@/components/layout/Header/Header";
import AttentionBanner from "@/components/radar/AttentionBanner/AttentionBanner";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function AttentionPage() {
  return (
    <div className={styles.page}>
      <Header
        title="Attention Center"
        subtitle="Priority Signal Matrix: Critical Issues, Opportunities & Reminders"
        actions={
          <Button variant="secondary" size="sm">
            Mark All as Resolved
          </Button>
        }
      />

      <div className={styles.content}>
        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>
            <Badge variant="danger" size="sm" dot>Critical</Badge>
            Requires Immediate Action
          </h3>
          <div className={styles.bannerList}>
            <AttentionBanner
              severity="critical"
              title="4 Leads Idle > 48 Hours"
              message="High-value prospects from the latest POS demo campaign have received no follow-up contact."
              actionLabel="Resolve Now"
            />
            <AttentionBanner
              severity="critical"
              title="Supermarket Segment Retention Alert"
              message="3 grocery store clients have not recorded cashier shift batches for 4 consecutive business days."
              actionLabel="Contact Accounts"
            />
          </div>
        </div>

        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>
            <Badge variant="warning" size="sm" dot>Warning</Badge>
            Pacing & Funnel Drift
          </h3>
          <div className={styles.bannerList}>
            <AttentionBanner
              severity="warning"
              title="Lead Pace 15% Below Monthly Target"
              message="Current inbound pace is 9.5 leads/week versus target requirement of 15 leads/week."
              actionLabel="Adjust Cadence"
            />
          </div>
        </div>

        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>
            <Badge variant="opportunity" size="sm" dot>Opportunity</Badge>
            High Velocity Signals
          </h3>
          <div className={styles.bannerList}>
            <AttentionBanner
              severity="opportunity"
              title="Video #21 Outperforming Channel Average by 2.4×"
              message="'Cashier Theft & Shift Discrepancy' theme is generating unprecedented inquiry density."
              actionLabel="Replicate Hook"
            />
          </div>
        </div>

        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>
            <Badge variant="reminder" size="sm" dot>Reminder</Badge>
            Operational Routine
          </h3>
          <div className={styles.bannerList}>
            <AttentionBanner
              severity="reminder"
              title="Scheduled TikTok Content Refresh"
              message="Goal engine requires 2 new video uploads before Thursday to maintain acquisition trajectory."
              actionLabel="View Queue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
