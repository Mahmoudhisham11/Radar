import styles from "./settings.module.css";
import Header from "@/components/layout/Header/Header";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import SystemHealth from "@/components/radar/SystemHealth/SystemHealth";

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <Header
        title="System Settings & Knowledge"
        subtitle="Configure Business Context, Integrations & Diagnostics"
      />

      <div className={styles.content}>
        {/* System Health Section */}
        <SystemHealth />

        <div className={styles.twoColumnGrid}>
          {/* Business & Marketing Context (AI Memory) */}
          <Card
            title="Business Memory & Positioning"
            subtitle="Ground truth context provided dynamically to RADAR AI"
          >
            <div className={styles.formList}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Product & Offer</label>
                <div className={styles.valueBox}>
                  Point of Sale (POS) & Cashier Management Software for retail and F&B.
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Target Audience</label>
                <div className={styles.valueBox}>
                  Grocery store owners, supermarket managers, café and restaurant operators.
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Primary Value Proposition</label>
                <div className={styles.valueBox}>
                  Eliminate cashier theft, synchronize inventory across multi-branches, and speed up rush-hour checkout with offline support.
                </div>
              </div>
            </div>
          </Card>

          {/* Integration Configuration */}
          <Card
            title="Integration & Provider Credentials"
            subtitle="Server-side managed connections"
          >
            <div className={styles.integrationList}>
              <div className={styles.integrationItem}>
                <div className={styles.integrationInfo}>
                  <span className={styles.integrationName}>TikTok Developer Sandbox</span>
                  <span className={styles.integrationDesc}>OAuth 2.0 • Persistent Token Storage</span>
                </div>
                <Badge variant="success" size="sm">Configured</Badge>
              </div>

              <div className={styles.integrationItem}>
                <div className={styles.integrationInfo}>
                  <span className={styles.integrationName}>Firebase Firestore</span>
                  <span className={styles.integrationDesc}>Server-Side Admin SDK + Client Realtime</span>
                </div>
                <Badge variant="accent" size="sm">Connected</Badge>
              </div>

              <div className={styles.integrationItem}>
                <div className={styles.integrationInfo}>
                  <span className={styles.integrationName}>OpenRouter AI Provider</span>
                  <span className={styles.integrationDesc}>Claude 3.5 Sonnet / GPT-4o-mini abstraction</span>
                </div>
                <Badge variant="purple" size="sm">Ready</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
