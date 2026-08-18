"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./tiktok.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

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

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  // Fetch Connection Status from Server
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/status", { cache: "no-store" });
      const data = await res.json();
      setConnection(data);

      if (data.status === "connected") {
        fetchProfileAndVideos();
      }
    } catch (err) {
      setConnection((prev) => ({
        ...prev,
        status: "error",
        lastError: err.message || "Failed to load connection status.",
      }));
    }
  }, []);

  // Fetch Profile & Video Data when Connected
  const fetchProfileAndVideos = async () => {
    try {
      const [profRes, vidRes] = await Promise.all([
        fetch("/api/integrations/tiktok/profile", { cache: "no-store" }),
        fetch("/api/integrations/tiktok/videos", { cache: "no-store" }),
      ]);

      if (profRes.ok) {
        const profData = await profRes.json();
        if (profData.profile) setProfile(profData.profile);
      }

      if (vidRes.ok) {
        const vidData = await vidRes.json();
        if (vidData.videos) setVideos(vidData.videos);
      }
    } catch (err) {
      console.error("Failed to load profile or videos:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStatus = urlParams.get("status");
      const urlError = urlParams.get("error");

      if (urlStatus === "connected") {
        setNotice("Successfully connected TikTok Developer Sandbox account!");
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (urlError) {
        setErrorMessage(urlError);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    fetchStatus();
  }, [fetchStatus]);

  // Compute Aggregate Channel Metrics from Real Video Ingestion
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

  // Handle Connect TikTok OAuth
  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/integrations/tiktok/authorize?json=true");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || "Failed to generate authorization URL.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to initialize TikTok login.");
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
        throw new Error(data.error || "Token refresh failed");
      }

      setNotice("TikTok access token refreshed successfully.");
      await fetchStatus();
    } catch (err) {
      setErrorMessage(err.message || "Failed to refresh token. Reconnection may be required.");
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
    if (!confirm("Are you sure you want to disconnect your TikTok account?")) return;

    setActionLoading(true);
    setNotice(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/integrations/tiktok/disconnect", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to disconnect.");
      }

      setProfile(null);
      setVideos([]);
      setNotice("TikTok account has been disconnected.");
      await fetchStatus();
    } catch (err) {
      setErrorMessage(err.message || "Failed to disconnect.");
    } finally {
      setActionLoading(false);
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
        return <Badge variant="success" size="md">Connected</Badge>;
      case "refreshing":
        return <Badge variant="warning" size="md">Refreshing...</Badge>;
      case "requires_reconnection":
        return <Badge variant="danger" size="md">Requires Reconnection</Badge>;
      case "expired":
        return <Badge variant="danger" size="md">Token Expired</Badge>;
      case "error":
        return <Badge variant="danger" size="md">Connection Error</Badge>;
      case "disconnected":
      default:
        return <Badge variant="default" size="md">Not Connected</Badge>;
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

  return (
    <div className={styles.page}>
      <Header
        title="TikTok Developer Sandbox"
        subtitle="Account Overview, Content Analytics & Synchronization Engine"
        actions={
          isConnected && (
            <Button
              variant="primary"
              size="sm"
              onClick={fetchProfileAndVideos}
              disabled={isRefreshing}
            >
              Sync Now
            </Button>
          )
        }
      />

      <div className={styles.content}>
        {/* Notice Banners */}
        {notice && <div className={styles.noticeBanner}>✓ {notice}</div>}

        {(errorMessage || connection.lastError) && (
          <div className={styles.errorBanner}>
            <span>⚠️ {errorMessage || connection.lastError}</span>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setErrorMessage(null);
              }}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* CONNECTION STATUS CARD */}
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
              {connection.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={connection.avatarUrl}
                  alt={connection.displayName || "TikTok"}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {isConnected
                    ? connection.username
                      ? connection.username.charAt(0).toUpperCase()
                      : "TK"
                    : "TK"}
                </div>
              )}

              <div className={styles.connectionTitleGroup}>
                <div className={styles.connectionTitleRow}>
                  <div className={getDotClass()} />
                  <h4 className={styles.connectionTitle}>TikTok</h4>
                  {getStatusBadge()}
                </div>

                <p className={styles.connectionSubtitle}>
                  {isConnected && (
                    <span>
                      {connection.username ? `@${connection.username}` : "TikTok Sandbox Account"}
                      {connection.displayName && ` (${connection.displayName})`}
                    </span>
                  )}
                  {isDisconnected &&
                    "Connect your TikTok Developer Sandbox account to track content and analytics."}
                  {isRefreshing && "Refreshing credentials with TikTok OAuth server..."}
                  {isError && "OAuth credentials expired or invalid. Please re-authenticate."}
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
                  Connect TikTok
                </Button>
              )}

              {isConnected && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? "Refreshing..." : "Refresh Connection"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={isRefreshing}
                  >
                    Disconnect
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
                  Reconnect
                </Button>
              )}
            </div>
          </div>

          {isConnected && connection.connectedAt && (
            <div className={styles.connectionMeta}>
              <span>Connected: {new Date(connection.connectedAt).toLocaleDateString()}</span>
              {connection.lastUpdated && (
                <span>Last Updated: {new Date(connection.lastUpdated).toLocaleTimeString()}</span>
              )}
            </div>
          )}
        </div>

        {/* ACCOUNT METRICS (Real Live Aggregated Numbers from Content) */}
        {isConnected && (
          <div className={styles.metricsGrid}>
            <StatCard
              label="Total Views"
              value={aggregateMetrics.totalViews.toLocaleString()}
              change="live"
              changeType="positive"
              period="Across all tracked videos"
            />
            <StatCard
              label="Total Likes"
              value={aggregateMetrics.totalLikes.toLocaleString()}
              change="❤️ engagement"
              changeType="positive"
              period="Direct audience likes"
            />
            <StatCard
              label="Total Comments"
              value={aggregateMetrics.totalComments.toLocaleString()}
              change="💬 conversations"
              changeType="neutral"
              period="Customer inquiries"
            />
            <StatCard
              label="Avg Engagement Rate"
              value={aggregateMetrics.avgEngagement}
              suffix=""
              changeType="positive"
              period={`${videos.length} videos tracked`}
            />
          </div>
        )}

        {/* VIDEO INTELLIGENCE CATALOG (CARDS GRID & TABLE TOGGLE) */}
        {isConnected && (
          <Card glow={true}>
            <div className={styles.catalogHeader}>
              <div className={styles.catalogTitleGroup}>
                <h3 className={styles.catalogTitle}>Video Intelligence Catalog</h3>
                <p className={styles.catalogSubtitle}>
                  Real videos and live engagement metrics fetched from your TikTok account
                </p>
              </div>

              <div className={styles.viewToggleGroup}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${viewMode === "cards" ? styles.activeToggle : ""}`}
                  onClick={() => setViewMode("cards")}
                >
                  <span>🎴 Video Cards</span>
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${viewMode === "table" ? styles.activeToggle : ""}`}
                  onClick={() => setViewMode("table")}
                >
                  <span>📋 Table</span>
                </button>
              </div>
            </div>

            {videos.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>No videos available yet</p>
                <p className={styles.emptyStateText}>
                  Click &quot;Sync Now&quot; to fetch your latest videos from TikTok.
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
                          <span style={{ fontSize: "11px" }}>TikTok Video</span>
                        </div>
                      )}

                      {vid.duration ? (
                        <span className={styles.durationBadge}>
                          ⏱️ {formatDuration(vid.duration)}
                        </span>
                      ) : null}

                      <span className={styles.dateBadge}>
                        {vid.publishTime ? new Date(vid.publishTime).toLocaleDateString() : ""}
                      </span>
                    </div>

                    {/* Card Content Body */}
                    <div className={styles.cardBody}>
                      <h4 className={styles.cardTitle} title={vid.title}>
                        {vid.title || "Untitled TikTok Video"}
                      </h4>

                      {/* Video Metrics Bar */}
                      <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Views</span>
                          <span className={styles.statVal}>
                            {vid.metrics?.views?.toLocaleString() ?? 0}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Likes</span>
                          <span className={styles.statVal}>
                            ❤️ {vid.metrics?.likes?.toLocaleString() ?? 0}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Comments</span>
                          <span className={styles.statVal}>
                            💬 {vid.metrics?.comments?.toLocaleString() ?? 0}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Shares</span>
                          <span className={styles.statVal}>
                            ↗️ {vid.metrics?.shares?.toLocaleString() ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className={styles.cardFooter}>
                        <span className={styles.engagementVal}>
                          Engagement: {vid.metrics?.engagementRate ?? 0}%
                        </span>

                        {vid.shareUrl ? (
                          <a
                            href={vid.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.watchLink}
                          >
                            Watch on TikTok ↗
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
                      <th>Video Title</th>
                      <th>Published</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Comments</th>
                      <th>Shares</th>
                      <th>Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((vid) => (
                      <tr key={vid.id}>
                        <td className={styles.videoTitleCell}>
                          <span className={styles.videoTitle}>{vid.title || "Untitled Video"}</span>
                          <span className={styles.videoMeta}>
                            ID: {vid.id} {vid.duration ? `• Duration: ${vid.duration}s` : ""}
                          </span>
                        </td>
                        <td>
                          {vid.publishTime ? new Date(vid.publishTime).toLocaleDateString() : "—"}
                        </td>
                        <td className={styles.monoCell}>
                          {vid.metrics?.views?.toLocaleString() ?? 0}
                        </td>
                        <td className={styles.monoCell}>
                          ❤️ {vid.metrics?.likes?.toLocaleString() ?? 0}
                        </td>
                        <td className={styles.monoCell}>
                          💬 {vid.metrics?.comments?.toLocaleString() ?? 0}
                        </td>
                        <td className={styles.monoCell}>
                          ↗️ {vid.metrics?.shares?.toLocaleString() ?? 0}
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
