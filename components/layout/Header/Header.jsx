import styles from "./Header.module.css";
import Badge from "@/components/ui/Badge/Badge";
import NotificationBell from "./NotificationBell";

export default function Header({
  title = "Command Center",
  subtitle = "AI Marketing & Growth Intelligence System",
  actions,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          <Badge variant="accent" size="sm">Live Feed</Badge>
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.right}>
        <NotificationBell />
        {actions}
        <div className={styles.userBadge}>
          <div className={styles.avatar}>HQ</div>
          <div className={styles.meta}>
            <span className={styles.role}>Owner Account</span>
            <span className={styles.status}>Internal Workspace</span>
          </div>
        </div>
      </div>
    </header>
  );
}
