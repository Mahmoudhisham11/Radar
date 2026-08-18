"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import Badge from "@/components/ui/Badge/Badge";

const NAV_ITEMS = [
  { label: "مركز القيادة", href: "/", badge: null },
  { label: "ذكاء التسويق", href: "/intelligence", badge: "AI" },
  { label: "تيك توك", href: "/tiktok", badge: "Sandbox" },
  { label: "المحتوى", href: "/content", badge: null },
  { label: "العملاء", href: "/customers", badge: null },
  { label: "العملاء المحتملين", href: "/leads", badge: null },
  { label: "الأهداف والمسار", href: "/goals", badge: null },
  { label: "اسأل رادار", href: "/ask-radar", badge: "جديد" },
  { label: "تنبيهات هامة", href: "/attention", badge: "3", badgeVariant: "danger" },
  { label: "الإعدادات", href: "/settings", badge: null },
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
          <span className={styles.brandTitle}>رادار RADAR</span>
          <span className={styles.brandSubtitle}>ذكاء التسويق والنمو</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.sectionTitle}>القائمة الرئيسية</div>
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
          <span className={styles.statusText}>النظام يعمل بكفاءة • مباشر</span>
        </div>
      </div>
    </aside>
  );
}
