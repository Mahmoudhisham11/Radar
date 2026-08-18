"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

const PRIMARY_NAV = [
  {
    label: "الرئيسية",
    href: "/",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "الذكاء",
    href: "/intelligence",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "تيك توك",
    href: "/tiktok",
    icon: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.891 2.891 2.896 2.896 0 0 1-2.891-2.89 2.896 2.896 0 0 1 2.891-2.892c.307 0 .603.048.88.137V9.43a6.33 6.33 0 0 0-.88-.063A6.335 6.335 0 0 0 3 15.702a6.335 6.335 0 0 0 6.333 6.334 6.335 6.335 0 0 0 6.334-6.334V8.473a8.217 8.217 0 0 0 4.922 1.637V6.686h-.999z"/>
      </svg>
    ),
  },
  {
    label: "الأهداف",
    href: "/goals",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const ALL_MENU_ITEMS = [
  { label: "مركز القيادة", href: "/", icon: "📊" },
  { label: "ذكاء التسويق", href: "/intelligence", icon: "⚡" },
  { label: "تيك توك", href: "/tiktok", icon: "📱" },
  { label: "المحتوى", href: "/content", icon: "🎬" },
  { label: "العملاء", href: "/customers", icon: "👥" },
  { label: "العملاء المحتملين", href: "/leads", icon: "🎯" },
  { label: "الأهداف والمسار", href: "/goals", icon: "📈" },
  { label: "اسأل رادار", href: "/ask-radar", icon: "💬" },
  { label: "تنبيهات هامة", href: "/attention", icon: "🚨" },
  { label: "الإعدادات", href: "/settings", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav className={styles.bottomNav}>
        {PRIMARY_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              onClick={() => setDrawerOpen(false)}
            >
              {isActive && <div className={styles.activeIndicator} />}
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}

        {/* More / Menu Button */}
        <button
          type="button"
          className={`${styles.navItem} ${drawerOpen ? styles.active : ""}`}
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="جميع الأقسام"
        >
          <span className={styles.navIcon}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
          <span className={styles.navLabel}>القائمة</span>
        </button>
      </nav>

      {/* Drawer Sheet for All Pages */}
      {drawerOpen && (
        <>
          <div
            className={styles.drawerOverlay}
            onClick={() => setDrawerOpen(false)}
          />
          <div className={styles.drawerSheet}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>أقسام رادار RADAR</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.gridMenu}>
              {ALL_MENU_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.gridMenuItem} ${
                      isActive ? styles.activeGridItem : ""
                    }`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <span className={styles.gridMenuIcon}>{item.icon}</span>
                    <span className={styles.gridMenuLabel}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
