"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./tiktok.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import {
  useTikTokVideos,
  useTikTokProfile,
  useTikTokSyncStatus,
} from "@/lib/hooks/useTikTokRealtime";

export default function TikTokPage() {
  const [connection, setConnection] = useState({
    status: "loading",
    username: null,
    displayName: null,
    avatarUrl: null,
    connectedAt: null,
    lastUpdated: null,
    lastError: null,
  });

  const { videos, loading: videosLoading, refetch: refetchVideos } = useTikTokVideos();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useTikTokProfile();
  const { syncStatus, syncing, triggerSync } = useTikTokSyncStatus();

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewMode, setViewMode] = useState("cards");

  // Fetch Connection Status from Server
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/status", { cache: "no-store" });
      const data = await res.json();
      setConnection(data);
      return data;
    } catch (err) {
      setConnection((prev) => ({
        ...prev,
        status: "error",
        lastError: err.message || "فشل في تحميل حالة الاتصال.",
      }));
      return null;
    }
  }, []);

  // Fetch Comments
  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      const res = await fetch("/api/integrations/tiktok/comments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // Handle Initial Load and OAuth Callback Redirects
  useEffect(() => {
    let urlStatus = null;
    let urlError = null;

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      urlStatus = urlParams.get("status");
      urlError = urlParams.get("error");

      if (urlStatus === "connected") {
        setNotice("تم ربط حساب تيك توك بنجاح! جاري مزامنة الفيديوهات والبيانات...");
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (urlError) {
        setErrorMessage(urlError);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    fetchStatus().then((statusData) => {
      if (urlStatus === "connected" || statusData?.status === "connected") {
        refetchProfile();
        refetchVideos();
        fetchComments();
      }
    });

    fetchComments();
  }, [fetchStatus, refetchProfile, refetchVideos, fetchComments]);

  // Compute Real Aggregate Channel Metrics from Ingested Videos
  const aggregateMetrics = useMemo(() => {
    if (!videos || videos.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgEngagement: "0%",
      };
    }

    const totalViews = videos.reduce((sum, v) => sum + (v.metrics?.views || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.metrics?.likes || 0), 0);
    const totalComments = videos.reduce((sum, v) => sum + (v.metrics?.comments || 0), 0);
    const totalShares = videos.reduce((sum, v) => sum + (v.metrics?.shares || 0), 0);

    const totalInteractions = totalLikes + totalComments + totalShares;
    const avgEngagement =
      totalViews > 0
        ? ((totalInteractions / totalViews) * 100).toFixed(2) + "%"
        : "0%";

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagement,
    };
  }, [videos]);

  // Handle Manual Sync
  const handleManualSync = async () => {
    setNotice(null);
    setErrorMessage(null);
    try {
      const res = await triggerSync();
      await fetchStatus();
      await refetchProfile();
      await refetchVideos();
      await fetchComments();

      if (res.status === "success") {
        setNotice(
          `تمت المزامنة بنجاح: تم معالجة ${res.videosProcessed || 0} فيديو، وتسجيل ${res.snapshotsCreated || 0} لقطة تحليلية.`
        );
      } else if (res.status === "skipped") {
        setNotice(res.message || "المزامنة جارية بالفعل.");
      }
    } catch (err) {
      setErrorMessage(err.message || "فشلت عملية المزامنة.");
    }
  };

  // Handle Connect TikTok OAuth
  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/integrations/tiktok/authorize?json=true");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || "فشل في توليد رابط تسجيل الدخول.");
      }
    } catch (err) {
      setErrorMessage(err.message || "فشل في بدء تسجيل الدخول إلى تيك توك.");
      setActionLoading(false);
    }
  };

  // Handle Refresh Connection
  const handleRefresh = async () => {
    setActionLoading(true);
    setNotice(null);
    setErrorMessage(null);
    setConnection((prev) => ({ ...prev, status: "refreshing" }));

    try {
      const res = await fetch("/api/integrations/tiktok/refresh", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل تحديث رمز المصادقة");
      }

      setNotice("تم تحديث رمز المصادقة بنجاح.");
      await fetchStatus();
      await refetchProfile();
    } catch (err) {
      setErrorMessage(err.message || "فشل تحديث الرمز. قد يتطلب إعادة الربط.");
      setConnection((prev) => ({
        ...prev,
        status: "requires_reconnection",
        lastError: err.message,
      }));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء ربط حساب تيك توك؟")) return;

    setActionLoading(true);
    setNotice(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/integrations/tiktok/disconnect", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("فشل إلغاء الربط.");
      }

      setNotice("تم إلغاء ربط حساب تيك توك بنجاح.");
      await fetchStatus();
    } catch (err) {
      setErrorMessage(err.message || "حدث خطأ أثناء إلغاء الربط.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Comment Reply
  const handleMarkReplied = async (commentId) => {
    try {
      const res = await fetch("/api/integrations/tiktok/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, action: "mark_replied" }),
      });

      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, replied: true } : c))
        );
        window.dispatchEvent(new CustomEvent("radar:comments_updated"));
      }
    } catch (err) {
      console.error("Failed to reply comment:", err);
    }
  };

  const isConnected = connection.status === "connected";
  const isRefreshing = connection.status === "refreshing" || actionLoading;
  const isError =
    connection.status === "error" ||
    connection.status === "requires_reconnection" ||
    connection.status === "expired";
  const isDisconnected =
    connection.status === "disconnected" ||
    (!isConnected && !isRefreshing && !isError && connection.status !== "loading");

  const getStatusBadge = () => {
    switch (connection.status) {
      case "connected":
        return <Badge variant="success" size="md">متصل ✓</Badge>;
      case "refreshing":
        return <Badge variant="warning" size="md">جاري التحديث...</Badge>;
      case "requires_reconnection":
        return <Badge variant="danger" size="md">يتطلب إعادة الربط</Badge>;
      case "expired":
        return <Badge variant="danger" size="md">انتهت الصلاحية</Badge>;
      case "error":
        return <Badge variant="danger" size="md">خطأ في الاتصال</Badge>;
      case "disconnected":
      default:
        return <Badge variant="default" size="md">غير متصل</Badge>;
    }
  };

  const getDotClass = () => {
    switch (connection.status) {
      case "connected":
        return `${styles.connectionDot} ${styles.dotConnected}`;
      case "refreshing":
        return `${styles.connectionDot} ${styles.dotRefreshing}`;
      case "requires_reconnection":
      case "expired":
      case "error":
        return `${styles.connectionDot} ${styles.dotError}`;
      default:
        return `${styles.connectionDot} ${styles.dotDisconnected}`;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const activeAvatar = profile?.avatarUrl || connection.avatarUrl;
  const activeDisplayName = profile?.displayName || connection.displayName || "حساب تيك توك";
  const activeUsername = profile?.username || connection.username || "";

  return (
    <div className={styles.page}>
      <Header
        title="تيك توك — مركز البيانات والتحليلات"
        subtitle="نظرة عامة على الحساب، تحليلات الفيديوهات وإشعارات التفاعل الفورية"
        actions={
          isConnected && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSync}
              disabled={syncing || isRefreshing}
            >
              {syncing ? "جاري المزامنة..." : "مزامنة الآن 🔄"}
            </Button>
          )
        }
      />

      <div className={styles.content}>
        {/* Notice & Error Banners */}
        {notice && (
          <div className={styles.noticeBanner}>
            <span>✓ {notice}</span>
            <Button variant="secondary" size="xs" onClick={() => setNotice(null)}>
              إغلاق
            </Button>
          </div>
        )}

        {(errorMessage || connection.lastError) && (
          <div className={styles.errorBanner}>
            <span>⚠️ {errorMessage || connection.lastError}</span>
            <Button variant="secondary" size="xs" onClick={() => setErrorMessage(null)}>
              إغلاق
            </Button>
          </div>
        )}

        {/* CONNECTION & OAUTH STATUS CARD */}
        <div
          className={`${styles.connectionCard} ${
            isConnected
              ? styles.connected
              : isError
              ? styles.error
              : styles.disconnected
          }`}
        >
          <div className={styles.connectionHeader}>
            <div className={styles.connectionLeft}>
              {activeAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeAvatar}
                  alt={activeDisplayName}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {isConnected
                    ? (activeUsername || "TK").charAt(0).toUpperCase()
                    : "TK"}
                </div>
              )}

              <div className={styles.connectionTitleGroup}>
                <div className={styles.connectionTitleRow}>
                  <div className={getDotClass()} />
                  <h4 className={styles.connectionTitle}>
                    {isConnected ? activeDisplayName : "حساب تيك توك"}
                  </h4>
                  {getStatusBadge()}
                  {syncing && <Badge variant="warning" size="sm">جاري المزامنة...</Badge>}
                </div>

                <p className={styles.connectionSubtitle}>
                  {isConnected && (
                    <span>
                      {activeUsername ? `@${activeUsername}` : "حساب تيك توك المرتبط"}
                      {activeDisplayName && ` • ${activeDisplayName}`}
                    </span>
                  )}
                  {isDisconnected &&
                    "قم بربط حساب TikTok Developer Sandbox لتتبع المحتوى، الفيديوهات والتعليقات مباشرة."}
                  {isRefreshing && "جاري تحديث بيانات الاعتماد مع خادم تيك توك..."}
                  {isError && "انتهت صلاحية المصادقة. يرجى إعادة تسجيل الدخول."}
                </p>
              </div>
            </div>

            {/* Connection Actions */}
            <div className={styles.connectionActions}>
              {isDisconnected && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConnect}
                  disabled={isRefreshing}
                >
                  ربط حساب تيك توك
                </Button>
              )}

              {isConnected && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing || syncing}
                  >
                    {isRefreshing ? "جاري التحديث..." : "تحديث الاتصال"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={isRefreshing || syncing}
                  >
                    إلغاء الربط
                  </Button>
                </>
              )}

              {isError && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConnect}
                  disabled={isRefreshing}
                >
                  إعادة الاتصال
                </Button>
              )}
            </div>
          </div>

          {/* Sync Metadata */}
          {isConnected && (
            <div className={styles.connectionMeta}>
              <span>تاريخ الربط: {connection.connectedAt ? new Date(connection.connectedAt).toLocaleDateString("ar-EG") : "نشط"}</span>
              <span>
                آخر مزامنة:{" "}
                {syncStatus.completedAt
                  ? new Date(syncStatus.completedAt).toLocaleTimeString("ar-EG")
                  : connection.lastUpdated
                  ? new Date(connection.lastUpdated).toLocaleTimeString("ar-EG")
                  : "الآن"}
              </span>
              <span>المزامنة التلقائية: مفعلة</span>
            </div>
          )}
        </div>

        {/* DETAILED ACCOUNT PROFILE CARD */}
        {isConnected && (
          <div className={styles.profileCard}>
            <div className={styles.profileTopRow}>
              <div className={styles.profileUserGroup}>
                {activeAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeAvatar}
                    alt={activeDisplayName}
                    className={styles.profileAvatarLarge}
                  />
                ) : (
                  <div className={styles.profileAvatarPlaceholder}>
                    {(activeUsername || "T").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className={styles.profileDetails}>
                  <div className={styles.profileNameRow}>
                    <h3 className={styles.profileDisplayName}>{activeDisplayName}</h3>
                    {profile?.isVerified && (
                      <Badge variant="accent" size="xs">موثق ✓</Badge>
                    )}
                    <span className={styles.profileHandle}>
                      {activeUsername ? `@${activeUsername}` : ""}
                    </span>
                  </div>

                  {profile?.bioDescription && (
                    <p className={styles.profileBio}>{profile.bioDescription}</p>
                  )}
                </div>
              </div>

              {profile?.profileDeepLink && (
                <a
                  href={profile.profileDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.watchLink}
                  style={{ fontSize: "12px" }}
                >
                  فتح الملف على TikTok ↗
                </a>
              )}
            </div>

            {/* Profile Followers & Account Stats */}
            <div className={styles.profileStatsGrid}>
              <div className={styles.profileStatItem}>
                <span className={styles.profileStatVal}>
                  {profile?.followerCount ? profile.followerCount.toLocaleString() : "—"}
                </span>
                <span className={styles.profileStatLabel}>المتابعون (Followers)</span>
              </div>
              <div className={styles.profileStatItem}>
                <span className={styles.profileStatVal}>
                  {profile?.followingCount ? profile.followingCount.toLocaleString() : "—"}
                </span>
                <span className={styles.profileStatLabel}>يتابع (Following)</span>
              </div>
              <div className={styles.profileStatItem}>
                <span className={styles.profileStatVal}>
                  {profile?.likesCount ? profile.likesCount.toLocaleString() : aggregateMetrics.totalLikes.toLocaleString()}
                </span>
                <span className={styles.profileStatLabel}>إجمالي الإعجابات (Likes)</span>
              </div>
              <div className={styles.profileStatItem}>
                <span className={styles.profileStatVal}>
                  {profile?.videoCount || videos.length || "0"}
                </span>
                <span className={styles.profileStatLabel}>عدد الفيديوهات (Videos)</span>
              </div>
            </div>
          </div>
        )}

        {/* REALTIME CHANNEL METRICS */}
        {isConnected && (
          <div className={styles.metricsGrid}>
            <StatCard
              label="إجمالي المشاهدات"
              value={videosLoading ? "..." : aggregateMetrics.totalViews.toLocaleString()}
              change="مباشر"
              changeType="positive"
              period="من جميع الفيديوهات المسجلة"
            />
            <StatCard
              label="إجمالي الإعجابات"
              value={videosLoading ? "..." : aggregateMetrics.totalLikes.toLocaleString()}
              change="❤️ تفاعل"
              changeType="positive"
              period="إعجابات الجمهور الحقيقية"
            />
            <StatCard
              label="إجمالي التعليقات"
              value={videosLoading ? "..." : aggregateMetrics.totalComments.toLocaleString()}
              change="💬 استفسارات"
              changeType="neutral"
              period="استفسارات العملاء والطلبات"
            />
            <StatCard
              label="معدل التفاعل العام"
              value={videosLoading ? "..." : aggregateMetrics.avgEngagement}
              changeType="positive"
              period={`تم تتبع ${videos.length} فيديو`}
            />
          </div>
        )}

        {/* RECENT COMMENTS & NOTIFICATIONS PANEL */}
        {isConnected && (
          <Card glow={true}>
            <div className={styles.catalogHeader}>
              <div className={styles.catalogTitleGroup}>
                <h3 className={styles.catalogTitle}>💬 التعليقات والتفاعلات المباشرة</h3>
                <p className={styles.catalogSubtitle}>
                  إشعارات فورية بالتعليقات الجديدة على الفيديوهات ومتابعة الرد على العملاء
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" size="xs" onClick={fetchComments}>
                  تحديث التعليقات 🔄
                </Button>
              </div>
            </div>

            {commentsLoading && comments.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>جاري تحميل التعليقات...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>لا توجد تعليقات جديدة حتى الآن</p>
                <p className={styles.emptyStateText}>
                  عندما يكتب أي عميل تعليقاً على فيديوهات التيك توك سيظهر لك هنا وفوراً في جرس الإشعارات.
                </p>
              </div>
            ) : (
              <div className={styles.commentsList}>
                {comments.slice(0, 10).map((comment) => (
                  <div
                    key={comment.id}
                    className={`${styles.commentCard} ${
                      comment.replied ? styles.repliedCard : styles.unrepliedCard
                    }`}
                  >
                    <div className={styles.commentTop}>
                      <div className={styles.commentAuthor}>
                        <span>👤 {comment.authorName}</span>
                        {!comment.replied ? (
                          <Badge variant="danger" size="xs">في انتظار الرد</Badge>
                        ) : (
                          <Badge variant="success" size="xs">تم الرد ✓</Badge>
                        )}
                      </div>
                      <span className={styles.commentTime}>
                        {comment.timestamp ? new Date(comment.timestamp).toLocaleString("ar-EG") : ""}
                      </span>
                    </div>

                    <div className={styles.commentVideoRef}>
                      <span>📹 {comment.videoTitle || "فيديو تيك توك"}</span>
                    </div>

                    <p className={styles.commentText}>&ldquo;{comment.text}&rdquo;</p>

                    <div className={styles.commentBottom}>
                      {!comment.replied ? (
                        <button
                          type="button"
                          className={styles.replyActionBtn}
                          onClick={() => handleMarkReplied(comment.id)}
                        >
                          ✓ تحديد كـ &quot;تم الرد على العميل&quot;
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--radar-success)" }}>
                          ✓ تم الرد والمتابعة بنجاح
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* VIDEO INTELLIGENCE CATALOG */}
        {isConnected && (
          <Card glow={true}>
            <div className={styles.catalogHeader}>
              <div className={styles.catalogTitleGroup}>
                <h3 className={styles.catalogTitle}>سجل ذكاء وتحليلات الفيديوهات</h3>
                <p className={styles.catalogSubtitle}>
                  بيانات فورية من حساب تيك توك • تتحدث تلقائياً مع كل مزامنة جديدة
                </p>
              </div>

              <div className={styles.viewToggleGroup}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${viewMode === "cards" ? styles.activeToggle : ""}`}
                  onClick={() => setViewMode("cards")}
                >
                  <span>🎴 كروت الفيديوهات</span>
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${viewMode === "table" ? styles.activeToggle : ""}`}
                  onClick={() => setViewMode("table")}
                >
                  <span>📋 جدول البيانات</span>
                </button>
              </div>
            </div>

            {videosLoading && videos.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>جاري تحميل الفيديوهات...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>لا توجد فيديوهات مسجلة حتى الآن</p>
                <p className={styles.emptyStateText}>
                  اضغط على زر &quot;مزامنة الآن&quot; بالأعلى لجلب الفيديوهات والتحليلات من تيك توك.
                </p>
              </div>
            ) : viewMode === "cards" ? (
              /* --- VIDEO CARDS GRID VIEW --- */
              <div className={styles.videoGrid}>
                {videos.map((vid) => (
                  <div key={vid.id} className={styles.videoCard}>
                    {/* Thumbnail / Cover Area */}
                    <div className={styles.thumbnailContainer}>
                      {vid.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={vid.coverImageUrl}
                          alt={vid.title}
                          className={styles.coverImage}
                        />
                      ) : (
                        <div className={styles.thumbnailPlaceholder}>
                          <span className={styles.playIcon}>▶</span>
                          <span style={{ fontSize: "11px" }}>فيديو تيك توك</span>
                        </div>
                      )}

                      {vid.duration ? (
                        <span className={styles.durationBadge}>
                          ⏱️ {formatDuration(vid.duration)}
                        </span>
                      ) : null}

                      <span className={styles.dateBadge}>
                        {vid.publishTime ? new Date(vid.publishTime).toLocaleDateString("ar-EG") : ""}
                      </span>
                    </div>

                    {/* Card Content Body */}
                    <div className={styles.cardBody}>
                      <h4 className={styles.cardTitle} title={vid.title}>
                        {vid.title || "فيديو تيك توك بدون عنوان"}
                      </h4>

                      {/* Video Metrics Bar */}
                      <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>المشاهدات</span>
                          <span className={styles.statVal}>
                            {vid.metrics?.views?.toLocaleString() ?? "—"}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>الإعجابات</span>
                          <span className={styles.statVal}>
                            ❤️ {vid.metrics?.likes?.toLocaleString() ?? "—"}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>التعليقات</span>
                          <span className={styles.statVal}>
                            💬 {vid.metrics?.comments?.toLocaleString() ?? "—"}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>المشاركات</span>
                          <span className={styles.statVal}>
                            ↗️ {vid.metrics?.shares?.toLocaleString() ?? "—"}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className={styles.cardFooter}>
                        <span className={styles.engagementVal}>
                          معدل التفاعل: {vid.metrics?.engagementRate ?? 0}%
                        </span>

                        {vid.shareUrl ? (
                          <a
                            href={vid.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.watchLink}
                          >
                            مشاهدة على تيك توك ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: "11px", color: "var(--radar-text-muted)" }}>
                            ID: {vid.id.slice(-6)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* --- TABLE VIEW --- */
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>عنوان الفيديو</th>
                      <th>تاريخ النشر</th>
                      <th>المشاهدات</th>
                      <th>الإعجابات</th>
                      <th>التعليقات</th>
                      <th>المشاركات</th>
                      <th>التفاعل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((vid) => (
                      <tr key={vid.id}>
                        <td className={styles.videoTitleCell}>
                          <span className={styles.videoTitle}>{vid.title || "فيديو بدون عنوان"}</span>
                          <span className={styles.videoMeta}>
                            ID: {vid.id} {vid.duration ? `• المدة: ${vid.duration} ثانية` : ""}
                          </span>
                        </td>
                        <td>
                          {vid.publishTime ? new Date(vid.publishTime).toLocaleDateString("ar-EG") : "—"}
                        </td>
                        <td className={styles.monoCell}>
                          {vid.metrics?.views?.toLocaleString() ?? "—"}
                        </td>
                        <td className={styles.monoCell}>
                          ❤️ {vid.metrics?.likes?.toLocaleString() ?? "—"}
                        </td>
                        <td className={styles.monoCell}>
                          💬 {vid.metrics?.comments?.toLocaleString() ?? "—"}
                        </td>
                        <td className={styles.monoCell}>
                          ↗️ {vid.metrics?.shares?.toLocaleString() ?? "—"}
                        </td>
                        <td className={styles.monoCell}>
                          <span className={styles.highlightGreen}>
                            {vid.metrics?.engagementRate ?? 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
