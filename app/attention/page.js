"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./attention.module.css";
import Header from "@/components/layout/Header/Header";
import AttentionBanner from "@/components/radar/AttentionBanner/AttentionBanner";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function AttentionPage() {
  const [unrepliedComments, setUnrepliedComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/comments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const pending = (data.comments || []).filter((c) => !c.replied);
        setUnrepliedComments(pending);
      }
    } catch (err) {
      console.error("Failed to load attention comments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 15000);

    const handleUpdate = () => fetchComments();
    window.addEventListener("radar:comments_updated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("radar:comments_updated", handleUpdate);
    };
  }, [fetchComments]);

  const handleMarkReplied = async (commentId) => {
    try {
      const res = await fetch("/api/integrations/tiktok/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, action: "mark_replied" }),
      });
      if (res.ok) {
        setUnrepliedComments((prev) => prev.filter((c) => c.id !== commentId));
        window.dispatchEvent(new CustomEvent("radar:comments_updated"));
      }
    } catch (err) {
      console.error("Failed to mark comment as replied:", err);
    }
  };

  return (
    <div className={styles.page}>
      <Header
        title="تنبيهات هامة ومركز المتابعة"
        subtitle="مصفوفة الإشارات الحرجة: متابعة التعليقات الفورية، العملاء المحتملين والفرص"
        actions={
          <Button variant="secondary" size="sm" onClick={fetchComments}>
            تحديث التنبيهات 🔄
          </Button>
        }
      />

      <div className={styles.content}>
        {/* CRITICAL ATTENTION & UNREPLIED TIKTOK COMMENTS */}
        {unrepliedComments.length > 0 ? (
          <div className={styles.categoryGroup}>
            <h3 className={styles.categoryTitle}>
              <Badge variant="danger" size="sm" dot>حرجة وعاجلة</Badge>
              استفسارات وتعليقات العملاء التي تتطلب رداً فورياً ({unrepliedComments.length})
            </h3>
            <div className={styles.bannerList}>
              {unrepliedComments.map((comment) => (
                <AttentionBanner
                  key={comment.id}
                  severity="critical"
                  title={`💬 تعليق جديد من ${comment.authorName} على ${comment.videoTitle || "فيديو تيك توك"}`}
                  message={`"${comment.text}"`}
                  actionLabel="✓ تم الرد على العميل"
                  onAction={() => handleMarkReplied(comment.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyNotice}>
            <span className={styles.emptyIcon}>🎉</span>
            <h4 className={styles.emptyTitle}>لا توجد تنبيهات عاجلة أو معلقة حالياً</h4>
            <p className={styles.emptySub}>
              جميع استفسارات وتعليقات العملاء تم الرد عليها بالكامل. يواصل رادار مراقبة التفاعلات الجديدة ومزامنتها فورياً.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
