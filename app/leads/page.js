import styles from "./leads.module.css";
import Header from "@/components/layout/Header/Header";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

const PIPELINE_STAGES = [
  { id: "new", name: "New Inbound", count: 12 },
  { id: "contacted", name: "Contacted", count: 9 },
  { id: "interested", name: "Interested", count: 7 },
  { id: "demo", name: "Demo Booked", count: 5 },
  { id: "negotiation", name: "Negotiation", count: 3 },
  { id: "won", name: "Won", count: 2 },
];

export default function LeadsPage() {
  return (
    <div className={styles.page}>
      <Header
        title="Lead Pipeline Management"
        subtitle="Inbound Marketing Funnel & High-Intent Conversion Tracking"
        actions={
          <Button variant="primary" size="sm">
            + New Lead
          </Button>
        }
      />

      <div className={styles.content}>
        {/* Pipeline Summary Bar */}
        <div className={styles.pipelineBar}>
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className={styles.stageCard}>
              <span className={styles.stageName}>{stage.name}</span>
              <span className={styles.stageCount}>{stage.count}</span>
            </div>
          ))}
        </div>

        {/* Lead Details */}
        <Card
          title="Active Leads Requiring Attention"
          subtitle="Ordered by AI intent score and idle time"
        >
          <div className={styles.leadList}>
            <div className={styles.leadItem}>
              <div className={styles.leadHeader}>
                <div className={styles.leadInfo}>
                  <h4 className={styles.leadTitle}>Cairo Grill House (2 Branches)</h4>
                  <span className={styles.leadSource}>Source: TikTok Video #21 • Stage: Demo Booked</span>
                </div>
                <Badge variant="danger" size="sm" dot>Idle &gt; 48h</Badge>
              </div>
              <p className={styles.leadNote}>
                Owner asked about kitchen display screen integration and branch synchronization during live session.
              </p>
              <div className={styles.leadActions}>
                <Button variant="primary" size="sm">Send WhatsApp Follow-up</Button>
                <Button variant="ghost" size="sm">Mark as Contacted</Button>
              </div>
            </div>

            <div className={styles.leadItem}>
              <div className={styles.leadHeader}>
                <div className={styles.leadInfo}>
                  <h4 className={styles.leadTitle}>Delta Mini-Market Chain</h4>
                  <span className={styles.leadSource}>Source: Direct DM • Stage: Interested</span>
                </div>
                <Badge variant="accent" size="sm">High Intent</Badge>
              </div>
              <p className={styles.leadNote}>
                Needs pricing breakdown for 5 barcode scanners and software licenses.
              </p>
              <div className={styles.leadActions}>
                <Button variant="primary" size="sm">Send Proposal</Button>
                <Button variant="ghost" size="sm">Schedule Demo</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
