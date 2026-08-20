"use client";

import styles from "./customers.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";

export default function CustomersPage() {
  const customers = [];

  return (
    <div className={styles.page}>
      <Header
        title="سجل وبيانات العملاء"
        subtitle="متابعة الحسابات، القيمة الدائمة ومصادر الاستحواذ"
        actions={
          <Button variant="primary" size="sm">
            + إضافة عميل جديد
          </Button>
        }
      />

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          <StatCard
            label="إجمالي العملاء"
            value="0"
            change="لا توجد بيانات"
            changeType="neutral"
            period="حسابات مسجلة"
          />
          <StatCard
            label="الحسابات النشطة"
            value="0"
            change="0%"
            changeType="neutral"
            period="معدل النشاط"
          />
          <StatCard
            label="متوسط القيمة الدائمة (LTV)"
            prefix="ج.م "
            value="0"
            change="0%"
            changeType="neutral"
            period="لكل عميل"
          />
          <StatCard
            label="حسابات تحت المتابعة"
            value="0"
            change="0"
            changeType="positive"
            period="لا توجد حسابات معرضة للخطر"
          />
        </div>

        <Card
          title="قائمة العملاء والحالة"
          subtitle="سجل حسابات العملاء الفعلي"
        >
          {customers.length === 0 ? (
            <div className={styles.emptyTable}>
              <p>لا يوجد عملاء مسجلون في النظام حالياً.</p>
              <p>يمكنك تسجيل العملاء يدوياً أو ربط قنوات البيع وإدارة علاقات العملاء (CRM) لمزامنة الحسابات تلقائياً.</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>اسم النشاط التجاري</th>
                    <th>القطاع</th>
                    <th>مصدر الاستحواذ</th>
                    <th>تاريخ الانضمام</th>
                    <th>إجمالي الإنفاق</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className={styles.customerName}>{c.name}</td>
                      <td>{c.segment}</td>
                      <td>{c.source}</td>
                      <td>{c.joinedDate}</td>
                      <td className={styles.monoCell}>{c.totalSpend}</td>
                      <td>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
