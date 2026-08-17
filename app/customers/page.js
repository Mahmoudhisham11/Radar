import styles from "./customers.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function CustomersPage() {
  return (
    <div className={styles.page}>
      <Header
        title="Customer Intelligence"
        subtitle="Paying Clients, Cohort Health & Acquisition Source Breakdown"
        actions={
          <Button variant="primary" size="sm">
            Add Customer
          </Button>
        }
      />

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          <StatCard
            label="Total Customers"
            value="84"
            change="+6"
            changeType="positive"
            period="new this month"
          />
          <StatCard
            label="Active Accounts"
            value="79"
            change="94%"
            changeType="positive"
            period="active retention"
          />
          <StatCard
            label="Avg Lifetime Value"
            prefix="EGP "
            value="18,400"
            change="+8.2%"
            changeType="positive"
            period="per business"
          />
          <StatCard
            label="At-Risk Accounts"
            value="3"
            change="-2"
            changeType="negative"
            period="requiring check-in"
          />
        </div>

        <Card
          title="Customer Roster & Status"
          subtitle="Real-time synchronized customer accounts"
        >
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Segment</th>
                  <th>Acquisition Source</th>
                  <th>Joined Date</th>
                  <th>Total Spend</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.customerName}>Al-Madina Supermarket</td>
                  <td>Retail / Grocery</td>
                  <td><Badge variant="accent" size="sm">TikTok Video #14</Badge></td>
                  <td>Aug 02, 2026</td>
                  <td className={styles.monoCell}>EGP 24,000</td>
                  <td><Badge variant="success" size="sm">Active</Badge></td>
                </tr>
                <tr>
                  <td className={styles.customerName}>Bean & Leaf Café (3 branches)</td>
                  <td>F&B / Hospitality</td>
                  <td><Badge variant="accent" size="sm">TikTok Video #19</Badge></td>
                  <td>Jul 18, 2026</td>
                  <td className={styles.monoCell}>EGP 42,000</td>
                  <td><Badge variant="success" size="sm">Active</Badge></td>
                </tr>
                <tr>
                  <td className={styles.customerName}>Nile Pharmacy Group</td>
                  <td>Pharmacy</td>
                  <td><Badge variant="default" size="sm">Direct Referral</Badge></td>
                  <td>Jun 11, 2026</td>
                  <td className={styles.monoCell}>EGP 18,500</td>
                  <td><Badge variant="warning" size="sm">At Risk</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
