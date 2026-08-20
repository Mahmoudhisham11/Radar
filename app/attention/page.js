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
        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>
            <Badge variant="danger" size="sm" dot>حرجة وعاجلة</Badge>
            تتطلب اتخاذ إجراء فوري
          </h3>
          <div className={styles.bannerList}>
            {/* Real Unreplied TikTok Comments */}
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

            <AttentionBanner
              severity="critical"
              title="4 عملاء محتملين في الانتظار > 48 ساعة"
              message="عملاء مهتمون بنظام الكاشير من حملة الفيديو الأخيرة لم يتم التواصل معهم بعد."
              actionLabel="معالجة الآن"
            />
            <AttentionBanner
              severity="critical"
              title="تنبيه استبقاء قطاع السوبرماركت"
              message="3 فروع سوبرماركت لم تسجل إغلاق ورديات كاشير لمدة 4 أيام عمل متتالية."
              actionLabel="التواصل مع الحسابات"
            />
          </div>
        </div>

        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>
            <Badge variant="warning" size="sm" dot>تحذير</Badge>
            مسار الأهداف وتدفق العملاء
          </h3>
          <div className={styles.bannerList}>
            <AttentionBanner
              severity="warning"
              title="معدل جذب العملاء أقل بـ 15% من المستهدف الشهري"
              message="المعدل الحالي 9.5 عميل/أسبوع مقارنة بالمستهدف المطلوب 15 عميل/أسبوع."
              actionLabel="تعديل الوتيرة"
            />
          </div>
        </div>

        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>
            <Badge variant="opportunity" size="sm" dot>فرصة نمو</Badge>
            إشارات محتوى عالية التفاعل
          </h3>
          <div className={styles.bannerList}>
            <AttentionBanner
              severity="opportunity"
              title="فيديو كشف عجز ورديات الكاشير يحقق تفاعل 2.4× أعلى من المعدل"
              message="موضوع 'منع سرقات الكاشير وجرد الدرج' يولد كثافة استفسارات شراء غير مسبوقة."
              actionLabel="تكرار الفكرة"
            />
          </div>
        </div>

        <div className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>
            <Badge variant="reminder" size="sm" dot>تذكير</Badge>
            المهام الروتينية
          </h3>
          <div className={styles.bannerList}>
            <AttentionBanner
              severity="reminder"
              title="موعد نشر فيديو تيك توك الجديد"
              message="محرك الأهداف يوصي بنشر فيديوهين جديدين قبل يوم الخميس للحفاظ على معدل النمو."
              actionLabel="عرض قائمة المحتوى"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
