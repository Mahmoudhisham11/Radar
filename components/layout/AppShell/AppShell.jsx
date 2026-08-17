"use client";

import styles from "./AppShell.module.css";
import Sidebar from "../Sidebar/Sidebar";

export default function AppShell({ children }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
