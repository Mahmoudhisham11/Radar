"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./tiktok.module.css";
import Header from "@/components/layout/Header/Header";
import StatCard from "@/components/ui/StatCard/StatCard";
import Card from "@/components/ui/Card/Card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";

export default function TikTokPage() {
  const [connection, setConnection] = useState({
    status: "loading", // "loading" | "connected" | "disconnected" | "refreshing" | "error" | "requires_reconnection"
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
      setConnection(prev => ({
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
    // Check URL parameters for OAuth redirect status or errors
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStatus = urlParams.get("status");
      const urlError = urlParams.get("error");

      if (urlStatus === "connected") {
        setNotice("Successfully connected TikTok Developer Sandbox account!");
        // Clear search params from URL without reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (urlError) {
        setErrorMessage(urlError);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    fetchStatus();
  }, [fetchStatus]);

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
    setConnection(prev => ({ ...prev, status: "refreshing" }));

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
      setConnection(prev => ({
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
  const isError = connection.status === "error" || connection.status === "requires_reconnection" || connection.status === "expired";
  const isDisconnected = connection.status === "disconnected" || (!isConnected && !isRefreshing && !isError && connection.status !== "loading");

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
        {notice && (
          <div className={styles.noticeBanner}>
            ✓ {notice}
          </div>
        )}

        {(errorMessage || connection.lastError) && (
          <div className={styles.errorBanner}>
            <span>⚠️ {errorMessage || connection.lastError}</span>
            <Button variant="secondary" size="xs" onClick={() => { setErrorMessage(null); }}>
              Dismiss
            </Button>
          </div>
        )}

        {/* 16. MINIMAL TIKTOK UI / CONNECTION CARD */}
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
                  {isConnected ? (connection.username ? connection.username.charAt(0).toUpperCase() : "TK") : "TK"}
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
                  {isDisconnected && "Connect your TikTok Developer Sandbox account to track content and analytics."}
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

        {/* Profile Metrics (Shown when connected) */}
        {isConnected && (
          <div className={styles.metricsGrid}>
            <StatCard
              label="Followers"
              value={profile?.followerCount?.toLocaleString() || "0"}
              change="live"
              changeType="neutral"
              period="Sandbox Account"
            />
            <StatCard
              label="Following"
              value={profile?.followingCount?.toLocaleString() || "0"}
              period="Sandbox Account"
            />
            <StatCard
              label="Total Likes"
              value={profile?.likesCount?.toLocaleString() || "0"}
              period="Total engagement"
            />
            <StatCard
              label="Videos Tracked"
              value={videos.length.toString()}
              suffix=" videos"
              period="Available in Sandbox"
            />
          </div>
        )}

        {/* Video Performance Table / Catalog */}
        {isConnected && (
          <Card
            title="Video Intelligence Catalog"
            subtitle="Videos fetched from TikTok Developer Sandbox API"
            action={<Badge variant="default" size="sm">{videos.length} Videos</Badge>}
          >
            {videos.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>No videos available yet</p>
                <p className={styles.emptyStateText}>
                  Sandbox accounts only expose videos uploaded by approved sandbox test users.
                  Upload a video in your Sandbox account or click &quot;Sync Now&quot;.
                </p>
              </div>
            ) : (
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
                        <td>{vid.publishTime ? new Date(vid.publishTime).toLocaleDateString() : "—"}</td>
                        <td className={styles.monoCell}>{vid.metrics?.views?.toLocaleString() ?? 0}</td>
                        <td className={styles.monoCell}>{vid.metrics?.likes?.toLocaleString() ?? 0}</td>
                        <td className={styles.monoCell}>{vid.metrics?.comments?.toLocaleString() ?? 0}</td>
                        <td className={styles.monoCell}>{vid.metrics?.shares?.toLocaleString() ?? 0}</td>
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
