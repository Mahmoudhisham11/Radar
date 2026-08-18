"use client";

import { useState, useEffect, useCallback } from "react";
import { getClientFirebase } from "@/lib/firebase/client";
import { doc, collection, onSnapshot, query, orderBy } from "firebase/firestore";

/**
 * Realtime TikTok Videos Hook
 * Subscribes to Firestore collection `tiktok_videos` via onSnapshot.
 * Updates React state instantly when Firestore changes without page reload.
 */
export function useTikTokVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFromApi = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/videos", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
          setVideos(data.videos);
        }
        return data.videos || [];
      }
    } catch (err) {
      setError(err.message);
    }
    return [];
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchFromApi();
    setLoading(false);
  }, [fetchFromApi]);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function setupVideosListener() {
      // 1. Initial fetch from API to ensure instant display of server-cached/synced videos
      await fetchFromApi();
      if (!isMounted) return;

      try {
        const { db, isConfigured } = getClientFirebase();

        if (isConfigured && db) {
          const videosQuery = query(
            collection(db, "tiktok_videos"),
            orderBy("publishTime", "desc")
          );

          unsubscribe = onSnapshot(
            videosQuery,
            async (snapshot) => {
              if (!isMounted) return;
              if (!snapshot.empty && snapshot.docs.length > 0) {
                const items = snapshot.docs.map((docSnap) => ({
                  id: docSnap.id,
                  ...docSnap.data(),
                }));
                setVideos(items);
              } else {
                // If Firestore collection is empty, attempt server API fallback
                await fetchFromApi();
              }
              setLoading(false);
            },
            async () => {
              // On listener error, fallback to API
              if (isMounted) {
                await fetchFromApi();
                setLoading(false);
              }
            }
          );
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    setupVideosListener();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [fetchFromApi]);

  return { videos, loading, error, refetch };
}

/**
 * Realtime TikTok Profile Hook
 * Subscribes to Firestore doc `tiktok_profiles/primary`.
 */
export function useTikTokProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFromApi = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/profile", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
        return data.profile || null;
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
    return null;
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchFromApi();
    setLoading(false);
  }, [fetchFromApi]);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function setupProfileListener() {
      await fetchFromApi();
      if (!isMounted) return;

      try {
        const { db, isConfigured } = getClientFirebase();

        if (isConfigured && db) {
          unsubscribe = onSnapshot(
            doc(db, "tiktok_profiles", "primary"),
            async (docSnap) => {
              if (!isMounted) return;
              if (docSnap.exists()) {
                setProfile({ id: docSnap.id, ...docSnap.data() });
              } else {
                await fetchFromApi();
              }
              setLoading(false);
            },
            async () => {
              if (isMounted) {
                await fetchFromApi();
                setLoading(false);
              }
            }
          );
        } else {
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    setupProfileListener();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [fetchFromApi]);

  return { profile, loading, refetch };
}

/**
 * Realtime Sync Status Hook
 * Subscribes to Firestore doc `sync_jobs/latest`.
 */
export function useTikTokSyncStatus() {
  const [syncStatus, setSyncStatus] = useState({
    status: "idle",
    startedAt: null,
    completedAt: null,
    lastSuccessfulSyncAt: null,
    videosProcessed: 0,
    videosUpdated: 0,
    snapshotsCreated: 0,
  });
  const [syncing, setSyncing] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/sync", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
        setSyncing(data.status === "syncing");
      }
    } catch (err) {
      console.error("Sync status fetch error:", err);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function setupSyncStatusListener() {
      try {
        const { db, isConfigured } = getClientFirebase();

        if (isConfigured && db) {
          unsubscribe = onSnapshot(
            doc(db, "sync_jobs", "latest"),
            (docSnap) => {
              if (!isMounted) return;
              if (docSnap.exists()) {
                const data = docSnap.data();
                setSyncStatus(data);
                setSyncing(data.status === "syncing");
              }
            },
            async () => {
              const res = await fetch("/api/integrations/tiktok/sync", { cache: "no-store" });
              if (res.ok && isMounted) {
                const data = await res.json();
                setSyncStatus(data);
                setSyncing(data.status === "syncing");
              }
            }
          );
        } else {
          const res = await fetch("/api/integrations/tiktok/sync", { cache: "no-store" });
          if (res.ok && isMounted) {
            const data = await res.json();
            setSyncStatus(data);
            setSyncing(data.status === "syncing");
          }
        }
      } catch {
        // Silent error catch
      }
    }

    setupSyncStatusListener();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/integrations/tiktok/sync", { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        setSyncStatus((prev) => ({ ...prev, ...data }));
      }
      return data;
    } catch (err) {
      console.error("Manual sync trigger error:", err);
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  return { syncStatus, syncing, triggerSync, refreshStatus };
}
