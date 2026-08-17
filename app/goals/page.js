import styles from "./goals.module.css";
import Header from "@/components/layout/Header/Header";
import GoalProgress from "@/components/radar/GoalProgress/GoalProgress";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";

export default function GoalsPage() {
  return (
    <div className={styles.page}>
      <Header
        title="Goals & Pacing Engine"
        subtitle="Translate High-Level Targets into Measurable Execution & Pacing"
        actions={
          <Button variant="primary" size="sm">
            + New Goal
          </Button>
        }
      />

      <div className={styles.content}>
        <div className={styles.goalsGrid}>
          <GoalProgress
            title="Monthly Acquisition: 30 New Customers"
            current={18}
            target={30}
            unit="customers"
            status="on_track"
            deadline="Aug 31, 2026"
            paceRecommendation="Current pace is 4.5/week. Target requires 3.0/week for remaining 2 weeks."
          />

          <GoalProgress
            title="Monthly Inbound: 60 Qualified Leads"
            current={38}
            target={60}
            unit="leads"
            status="at_risk"
            deadline="Aug 31, 2026"
            paceRecommendation="Need 11 leads/week to hit target. Boost video cadence by 2 videos/week."
          />

          <GoalProgress
            title="Content Velocity: 16 High-Impact TikToks"
            current={12}
            target={16}
            unit="videos"
            status="ahead"
            deadline="Aug 31, 2026"
            paceRecommendation="Ahead of schedule by +2 videos. Maintain consistency."
          />

          <GoalProgress
            title="Monthly Revenue: EGP 200,000"
            current={142500}
            target={200000}
            unit="EGP"
            status="on_track"
            deadline="Aug 31, 2026"
            paceRecommendation="Projected to finish at EGP 208,000 based on current deal pipeline."
          />
        </div>
      </div>
    </div>
  );
}
