import styles from "./page.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import InsightCard from "@/components/radar/InsightCard/InsightCard";
import AttentionBanner from "@/components/radar/AttentionBanner/AttentionBanner";
import GoalProgress from "@/components/radar/GoalProgress/GoalProgress";
import SystemHealth from "@/components/radar/SystemHealth/SystemHealth";

export default function CommandCenterPage() {
  return (
    <div className={styles.page}>
      <Header
        title="Command Center"
        subtitle="Live Marketing & Growth Management Overview"
      />

      <div className={styles.content}>
        {/* Attention Center Banner */}
        <section className={styles.attentionSection}>
          <AttentionBanner
            severity="critical"
            title="High-Intent Lead Follow-up Needed"
            message="4 qualified leads from recent TikTok POS demos have been idle for >48 hours."
            actionLabel="View Leads"
          />
        </section>

        {/* Key Performance Metrics */}
        <section className={styles.metricsGrid}>
          <StatCard
            label="Monthly Revenue"
            prefix="EGP "
            value="142,500"
            change="18.4%"
            changeType="positive"
            period="vs last month"
          />
          <StatCard
            label="Active Customers"
            value="84"
            change="6"
            changeType="positive"
            period="new this month"
          />
          <StatCard
            label="Qualified Leads"
            value="38"
            change="12.5%"
            changeType="negative"
            period="pipeline velocity"
          />
          <StatCard
            label="TikTok Views (30d)"
            value="128.4K"
            change="24.2%"
            changeType="positive"
            period="avg engagement 4.8%"
          />
        </section>

        {/* Main Intelligence & Goals Grid */}
        <div className={styles.twoColumnGrid}>
          {/* Left Column: AI Intelligence & Insights */}
          <div className={styles.column}>
            <Card
              title="RADAR Intelligence"
              subtitle="Data-backed problems, opportunities, and action signals"
            >
              <div className={styles.insightsList}>
                <InsightCard
                  type="opportunity"
                  severity="info"
                  title="Content Hook Velocity Outperforming Average"
                  summary="Videos highlighting the 'Inventory Wastage in Grocery' problem achieved 2.4× standard watch completion."
                  evidence={[
                    { metric: "Watch Through Rate", change: "68%", period: "Last 7 days" },
                    { metric: "Inbound DMs / Leads", change: "+9 leads", period: "From 2 videos" }
                  ]}
                  recommendedActions={[
                    { action: "Generate 3 script variations focused on retail inventory shrinkage." }
                  ]}
                />

                <InsightCard
                  type="problem"
                  severity="critical"
                  title="Lead-to-Demo Conversion Friction"
                  summary="Lead acquisition increased by 22%, but demo booking rate dropped 15% due to delayed initial response time."
                  evidence={[
                    { metric: "Avg Response Time", change: "14.2 hrs", period: "Target: <2 hrs" },
                    { metric: "Demo Conversion", change: "-15%", period: "Week over week" }
                  ]}
                  recommendedActions={[
                    { action: "Review pipeline automation and dispatch follow-ups to recent contacts." }
                  ]}
                />
              </div>
            </Card>
          </div>

          {/* Right Column: Goal Engine & System Health */}
          <div className={styles.column}>
            <Card
              title="Active Goals & Pacing"
              subtitle="Continuous target vs actual tracking"
            >
              <div className={styles.goalsList}>
                <GoalProgress
                  title="30 New Paying Customers"
                  current={18}
                  target={30}
                  unit="customers"
                  status="on_track"
                  deadline="End of Month"
                  paceRecommendation="Requires 3 new customers / week to meet target."
                />
                <GoalProgress
                  title="60 Qualified Inbound Leads"
                  current={38}
                  target={60}
                  unit="leads"
                  status="at_risk"
                  deadline="End of Month"
                  paceRecommendation="Lead pace is -15% below target. Increase video publishing cadence."
                />
                <GoalProgress
                  title="16 High-Impact TikTok Videos"
                  current={12}
                  target={16}
                  unit="videos"
                  status="ahead"
                  deadline="End of Month"
                  paceRecommendation="Pacing +25% ahead of monthly target."
                />
              </div>
            </Card>

            <SystemHealth />
          </div>
        </div>
      </div>
    </div>
  );
}
