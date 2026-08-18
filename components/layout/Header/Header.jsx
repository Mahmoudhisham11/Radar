import styles from "./Header.module.css";
import Badge from "@/components/ui/Badge/Badge";
import NotificationBell from "./NotificationBell";

export default function Header({
  title = "مركز القيادة",
  subtitle = "نظام ذكاء التسويق وإدارة النمو المتقدم",
  actions,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          <Badge variant="accent" size="sm">مباشر</Badge>
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.right}>
        <NotificationBell />
        {actions}
        <div className={styles.userBadge}>
          <div className={styles.avatar}>HQ</div>
          <div className={styles.meta}>
            <span className={styles.role}>حساب المالك</span>
            <span className={styles.status}>مساحة العمل</span>
          </div>
        </div>
      </div>
    </header>
  );
}
