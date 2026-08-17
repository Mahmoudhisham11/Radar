import styles from "./content.module.css";
import Header from "@/components/layout/Header/Header";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function ContentPage() {
  return (
    <div className={styles.page}>
      <Header
        title="Content Intelligence"
        subtitle="Topic, Hook & Creative Performance Engine"
        actions={
          <Button variant="primary" size="sm">
            Generate Content Plan
          </Button>
        }
      />

      <div className={styles.content}>
        {/* Top Topic & Hook Matrix */}
        <div className={styles.twoColumnGrid}>
          <Card
            title="Top Performing Hooks"
            subtitle="Ranked by 3-second retention and lead conversion"
          >
            <div className={styles.hookList}>
              <div className={styles.hookItem}>
                <div className={styles.hookHeader}>
                  <Badge variant="accent" size="sm">1. Problem / Pain Point</Badge>
                  <span className={styles.hookScore}>8.4% Conv</span>
                </div>
                <p className={styles.hookText}>&ldquo;If your cashier still uses Excel or paper notes during rush hour, you are losing at least 15% daily.&rdquo;</p>
                <div className={styles.hookStats}>
                  <span>Avg Views: 38.2K</span>
                  <span>Avg Leads / Video: 7</span>
                </div>
              </div>

              <div className={styles.hookItem}>
                <div className={styles.hookHeader}>
                  <Badge variant="purple" size="sm">2. Multi-Branch Workflow</Badge>
                  <span className={styles.hookScore}>6.2% Conv</span>
                </div>
                <p className={styles.hookText}>&ldquo;How to see today&apos;s live sales across 3 branches from your phone in 5 seconds.&rdquo;</p>
                <div className={styles.hookStats}>
                  <span>Avg Views: 24.1K</span>
                  <span>Avg Leads / Video: 5</span>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="AI Recommended Next Content"
            subtitle="Evidence-backed content recommendations for this week"
          >
            <div className={styles.recommendationList}>
              <div className={styles.recItem}>
                <div className={styles.recHeader}>
                  <span className={styles.recTopic}>Retail & Grocery Stock Discrepancy</span>
                  <Badge variant="success" size="sm">High Priority</Badge>
                </div>
                <p className={styles.recDescription}>
                  Create 3 variations explaining barcode audit vs physical shelf count. Evidence: Inquiries for grocery features are up 35%.
                </p>
                <div className={styles.recActions}>
                  <Button variant="outline" size="sm">View AI Script Outline</Button>
                </div>
              </div>

              <div className={styles.recItem}>
                <div className={styles.recHeader}>
                  <span className={styles.recTopic}>Offline-Mode POS Reliability</span>
                  <Badge variant="accent" size="sm">Medium Priority</Badge>
                </div>
                <p className={styles.recDescription}>
                  Demonstrate system printing receipts when internet cuts out. Evidence: Frequently asked question in 18 comment threads.
                </p>
                <div className={styles.recActions}>
                  <Button variant="outline" size="sm">View AI Script Outline</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
