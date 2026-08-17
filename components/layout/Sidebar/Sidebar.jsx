"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import Badge from "@/components/ui/Badge/Badge";

const NAV_ITEMS = [
  { label: "Command Center", href: "/", badge: null },
  { label: "Intelligence", href: "/intelligence", badge: "AI" },
  { label: "TikTok", href: "/tiktok", badge: "Sandbox" },
  { label: "Content", href: "/content", badge: null },
  { label: "Customers", href: "/customers", badge: null },
  { label: "Leads", href: "/leads", badge: null },
  { label: "Goals", href: "/goals", badge: null },
  { label: "Ask RADAR", href: "/ask-radar", badge: "New" },
  { label: "Attention", href: "/attention", badge: "3", badgeVariant: "danger" },
  { label: "Settings", href: "/settings", badge: null },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.radarLogo}>
          <span className={styles.radarPing} />
          <span className={styles.radarCore} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandTitle}>RADAR</span>
          <span className={styles.brandSubtitle}>AI Marketing Intel</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.sectionTitle}>Main Navigation</div>
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                >
                  <span className={styles.linkText}>{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || (isActive ? "accent" : "default")}
                      size="sm"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.systemStatus}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>v0.1.0 • Phase 0 Foundation</span>
        </div>
      </div>
    </aside>
  );
}
