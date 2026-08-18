"use client";

import styles from "./AppShell.module.css";
import Sidebar from "../Sidebar/Sidebar";
import BottomNav from "../BottomNav/BottomNav";

export default function AppShell({ children }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
