"use client";

import { useEffect, useState } from "react";
import styles from "./SystemHealth.module.css";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchHealth() {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({ status: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setHealth(data);
      })
      .catch(() => {
        if (isMounted) setHealth({ status: "error" });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status, configured) => {
    if (!configured && status === "unconfigured") {
      return <Badge variant="warning" size="sm">غير مهيأ</Badge>;
    }
    if (status === "connected" || status === "ready" || status === "success") {
      return <Badge variant="success" size="sm">يعمل بكفاءة ✓</Badge>;
    }
    if (status === "disconnected" || status === "ready_to_connect") {
      return <Badge variant="default" size="sm">جاهز للربط</Badge>;
    }
    return <Badge variant="danger" size="sm">خطأ</Badge>;
  };

  return (
    <div className={styles.healthContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.indicator} />
          <h4 className={styles.title}>حالة وتكامل الأنظمة</h4>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchHealth} disabled={loading}>
          {loading ? "جاري الفحص..." : "تحديث الفحص"}
        </Button>
      </div>

      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.itemName}>قاعدة بيانات فايربيس (Firestore)</span>
          {getStatusBadge(health?.services?.firebase?.status, health?.services?.firebase?.configured)}
        </div>
        <div className={styles.item}>
          <span className={styles.itemName}>تكامل تيك توك (TikTok Sandbox)</span>
          {getStatusBadge(health?.services?.tiktokConnection?.status, health?.services?.tiktokConnection?.configured)}
        </div>
        <div className={styles.item}>
          <span className={styles.itemName}>مزود الذكاء الاصطناعي (OpenRouter AI)</span>
          {getStatusBadge(health?.services?.aiProvider?.status, health?.services?.aiProvider?.configured)}
        </div>
        <div className={styles.item}>
          <span className={styles.itemName}>محرك المزامنة الفورية (Sync Engine)</span>
          {getStatusBadge(health?.services?.syncEngine?.status || "idle", true)}
        </div>
      </div>
    </div>
  );
}
