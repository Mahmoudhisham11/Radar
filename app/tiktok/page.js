import styles from "./tiktok.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function TikTokPage() {
  return (
    <div className={styles.page}>
      <Header
        title="TikTok Developer Sandbox"
        subtitle="Account Overview, Content Analytics & Synchronization Engine"
        actions={
          <Button variant="primary" size="sm">
            Sync Now
          </Button>
        }
      />

      <div className={styles.content}>
        {/* Connection Status Banner */}
        <div className={styles.connectionCard}>
          <div className={styles.connectionLeft}>
            <div className={styles.connectionDot} />
            <div>
              <h4 className={styles.connectionTitle}>TikTok Developer Sandbox: Connected & Persistent</h4>
              <p className={styles.connectionSubtitle}>
                OAuth token active • Auto-refresh configured • Server-side persistence enabled
              </p>
            </div>
          </div>
          <div className={styles.connectionActions}>
            <Badge variant="success" size="md">Connected</Badge>
            <Button variant="secondary" size="sm">Re-authenticate</Button>
          </div>
        </div>

        {/* Profile Metrics */}
        <div className={styles.metricsGrid}>
          <StatCard
            label="Followers"
            value="14.2K"
            change="+420"
            changeType="positive"
            period="past 30 days"
          />
          <StatCard
            label="Total Views"
            value="128.4K"
            change="+24.2%"
            changeType="positive"
            period="monthly volume"
          />
          <StatCard
            label="Avg Engagement"
            value="5.2%"
            change="+0.8%"
            changeType="positive"
            period="likes, comments, shares"
          />
          <StatCard
            label="Videos Tracked"
            value="24"
            suffix=" videos"
            period="with time-series snapshots"
          />
        </div>

        {/* Video Performance Table / Catalog */}
        <Card
          title="Video Intelligence Catalog"
          subtitle="Time-series tracked videos with historical snapshot analytics"
          action={<Badge variant="default" size="sm">24 Videos</Badge>}
        >
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Video Title / Hook</th>
                  <th>Published</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Engagement</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.videoTitleCell}>
                    <span className={styles.videoTitle}>Stop losing money on manual cashier errors</span>
                    <span className={styles.videoMeta}>Duration: 42s • ID: tk_982341</span>
                  </td>
                  <td>3 days ago</td>
                  <td className={styles.monoCell}>42,800</td>
                  <td className={styles.monoCell}>3,210</td>
                  <td className={styles.monoCell}>184</td>
                  <td className={styles.monoCell}>
                    <span className={styles.highlightGreen}>8.2%</span>
                  </td>
                  <td>
                    <Badge variant="accent" size="sm">High Velocity</Badge>
                  </td>
                </tr>
                <tr>
                  <td className={styles.videoTitleCell}>
                    <span className={styles.videoTitle}>How a 3-branch café handles rush hour billing</span>
                    <span className={styles.videoMeta}>Duration: 58s • ID: tk_982119</span>
                  </td>
                  <td>6 days ago</td>
                  <td className={styles.monoCell}>28,400</td>
                  <td className={styles.monoCell}>1,840</td>
                  <td className={styles.monoCell}>96</td>
                  <td className={styles.monoCell}>6.8%</td>
                  <td>
                    <Badge variant="purple" size="sm">Steady Growth</Badge>
                  </td>
                </tr>
                <tr>
                  <td className={styles.videoTitleCell}>
                    <span className={styles.videoTitle}>Quick walkthrough: Setting up your barcode printer</span>
                    <span className={styles.videoMeta}>Duration: 30s • ID: tk_981902</span>
                  </td>
                  <td>12 days ago</td>
                  <td className={styles.monoCell}>9,120</td>
                  <td className={styles.monoCell}>340</td>
                  <td className={styles.monoCell}>14</td>
                  <td className={styles.monoCell}>3.9%</td>
                  <td>
                    <Badge variant="default" size="sm">Average</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
