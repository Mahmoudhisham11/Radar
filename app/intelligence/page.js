import styles from "./intelligence.module.css";
import Header from "@/components/layout/Header/Header";
import InsightCard from "@/components/radar/InsightCard/InsightCard";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";

export default function IntelligencePage() {
  return (
    <div className={styles.page}>
      <Header
        title="Intelligence Center"
        subtitle="Data → Intelligence → Decision → Action Engine"
      />

      <div className={styles.content}>
        <div className={styles.headerInfo}>
          <div className={styles.philosophyBox}>
            <span className={styles.philosophyLabel}>Intelligence Core:</span>
            <span className={styles.philosophyText}>
              Every recommendation is derived strictly from real RADAR business & marketing data.
            </span>
          </div>
          <div className={styles.stats}>
            <Badge variant="danger" size="md">2 Problems</Badge>
            <Badge variant="accent" size="md">3 Opportunities</Badge>
            <Badge variant="purple" size="md">2 Trends</Badge>
          </div>
        </div>

        <div className={styles.sectionGrid}>
          {/* Problems */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.problemDot} />
              Problems Requiring Attention
            </h3>
            <div className={styles.cardList}>
              <InsightCard
                type="problem"
                severity="critical"
                title="Lead-to-Demo Conversion Lag"
                summary="Leads from the latest 3 videos dropped in booking rate by 15% due to delayed follow-ups."
                evidence={[
                  { metric: "Demo Conversion", change: "-15%", period: "Last 7 days" },
                  { metric: "Average Delay", change: "14.2 hours", period: "Target: <2h" }
                ]}
                recommendedActions={[
                  { action: "Follow up immediately with 4 uncontacted leads in pipeline." }
                ]}
              />

              <InsightCard
                type="problem"
                severity="warning"
                title="Supermarket Segment Customer Churn Warning"
                summary="Supermarket accounts show a 28% drop in active daily cashier sessions over 3 weeks."
                evidence={[
                  { metric: "Session Volume", change: "-28%", period: "Last 21 days" },
                  { metric: "Affected Accounts", change: "3 Supermarket clients" }
                ]}
                recommendedActions={[
                  { action: "Trigger customer success check-in for grocery accounts." }
                ]}
              />
            </div>
          </div>

          {/* Opportunities */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.opportunityDot} />
              Growth Opportunities
            </h3>
            <div className={styles.cardList}>
              <InsightCard
                type="opportunity"
                severity="info"
                title="High Conversion Hook: 'Cashier Fraud Detection'"
                summary="Short-form video focusing on cashier shift reconciliation generated 3.1× average inbound inquiries."
                evidence={[
                  { metric: "Engagement Rate", change: "7.8%", period: "Benchmark: 3.2%" },
                  { metric: "Inbound DMs", change: "+14 qualified", period: "From 1 video" }
                ]}
                recommendedActions={[
                  { action: "Script and record 2 new variations exploring cash discrepancy prevention." }
                ]}
              />

              <InsightCard
                type="opportunity"
                severity="info"
                title="Restaurant Expansion Velocity"
                summary="Inquiries from multi-branch café owners increased by 40% after the inventory synchronization showcase."
                evidence={[
                  { metric: "Café Segment Inquiries", change: "+40%", period: "Last 14 days" }
                ]}
                recommendedActions={[
                  { action: "Publish a dedicated case study highlighting multi-branch sync." }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
