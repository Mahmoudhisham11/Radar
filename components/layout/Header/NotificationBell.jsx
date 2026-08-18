"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./NotificationBell.module.css";
import Badge from "@/components/ui/Badge/Badge";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [unrepliedCount, setUnrepliedCount] = useState(0);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "all"
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        const res = await fetch("/api/integrations/tiktok/comments", { cache: "no-store" });
        if (res.ok && isMounted) {
          const data = await res.json();
          setComments(data.comments || []);
          setUnrepliedCount(data.unrepliedCount || 0);
        }
      } catch (err) {
        console.error("Failed to load comment notifications:", err);
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/comments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setUnrepliedCount(data.unrepliedCount || 0);
      }
    } catch (err) {
      console.error("Failed to refresh comments:", err);
    }
  };

  const handleMarkReplied = async (commentId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/integrations/tiktok/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, action: "mark_replied" }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, replied: true } : c))
        );
        setUnrepliedCount(data.unrepliedCount);
      }
    } catch (err) {
      console.error("Failed to mark comment as replied:", err);
    }
  };

  const filteredComments = comments.filter((c) =>
    activeTab === "pending" ? !c.replied : true
  );

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={`${styles.bellButton} ${isOpen ? styles.active : ""}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) handleRefresh();
        }}
        title="إشعارات التعليقات"
      >
        <svg
          className={styles.icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unrepliedCount > 0 && (
          <span className={styles.badge}>{unrepliedCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.headerTitle}>
              <span>🔔 إشعارات التعليقات</span>
            </div>
            {unrepliedCount > 0 ? (
              <Badge variant="danger" size="xs">
                {unrepliedCount} يحتاج للرد
              </Badge>
            ) : (
              <Badge variant="success" size="xs">
                تم الرد على الكل ✓
              </Badge>
            )}
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "pending" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("pending")}
            >
              في انتظار الرد ({comments.filter((c) => !c.replied).length})
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "all" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("all")}
            >
              كل التعليقات ({comments.length})
            </button>
          </div>

          <div className={styles.commentList}>
            {filteredComments.length === 0 ? (
              <div className={styles.emptyDropdown}>
                {activeTab === "pending"
                  ? "🎉 رائع! تم الرد على جميع التعليقات السابقة."
                  : "لا توجد تعليقات حتى الآن."}
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`${styles.commentItem} ${
                    comment.replied ? styles.replied : styles.unreplied
                  }`}
                >
                  <div className={styles.commentVideoRow}>
                    <span className={styles.videoTitle} title={comment.videoTitle}>
                      📹 {comment.videoTitle || "فيديو تيك توك"}
                    </span>
                  </div>

                  <div className={styles.authorRow}>
                    <span className={styles.authorName}>
                      👤 {comment.authorName}
                    </span>
                    <span className={styles.time}>
                      {comment.timestamp
                        ? new Date(comment.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  <p className={styles.commentText}>&ldquo;{comment.text}&rdquo;</p>

                  <div className={styles.actionRow}>
                    {!comment.replied ? (
                      <button
                        type="button"
                        className={styles.replyButton}
                        onClick={(e) => handleMarkReplied(comment.id, e)}
                      >
                        ✓ تم الرد على العميل
                      </button>
                    ) : (
                      <span className={styles.repliedBadge}>
                        <Badge variant="default" size="xs">
                          تم الرد ✓
                        </Badge>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
