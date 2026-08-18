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

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/videos", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function setupVideosListener() {
      try {
        const { db, isConfigured } = getClientFirebase();

        if (isConfigured && db) {
          const videosQuery = query(
            collection(db, "tiktok_videos"),
            orderBy("publishTime", "desc")
          );

          unsubscribe = onSnapshot(
            videosQuery,
            (snapshot) => {
              if (!isMounted) return;
              const items = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              }));
              setVideos(items);
              setLoading(false);
            },
            async () => {
              // On listener error, fallback to API
              const res = await fetch("/api/integrations/tiktok/videos", { cache: "no-store" });
              if (res.ok && isMounted) {
                const data = await res.json();
                setVideos(data.videos || []);
                setLoading(false);
              }
            }
          );
        } else {
          const res = await fetch("/api/integrations/tiktok/videos", { cache: "no-store" });
          if (res.ok && isMounted) {
            const data = await res.json();
            setVideos(data.videos || []);
          }
          if (isMounted) setLoading(false);
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
  }, []);

  return { videos, loading, error, refetch };
}

/**
 * Realtime TikTok Profile Hook
 * Subscribes to Firestore doc `tiktok_profiles/primary`.
 */
export function useTikTokProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/tiktok/profile", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || null);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function setupProfileListener() {
      try {
        const { db, isConfigured } = getClientFirebase();

        if (isConfigured && db) {
          unsubscribe = onSnapshot(
            doc(db, "tiktok_profiles", "primary"),
            (docSnap) => {
              if (!isMounted) return;
              if (docSnap.exists()) {
                setProfile({ id: docSnap.id, ...docSnap.data() });
              }
              setLoading(false);
            },
            async () => {
              const res = await fetch("/api/integrations/tiktok/profile", { cache: "no-store" });
              if (res.ok && isMounted) {
                const data = await res.json();
                setProfile(data.profile || null);
                setLoading(false);
              }
            }
          );
        } else {
          const res = await fetch("/api/integrations/tiktok/profile", { cache: "no-store" });
          if (res.ok && isMounted) {
            const data = await res.json();
            setProfile(data.profile || null);
          }
          if (isMounted) setLoading(false);
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
  }, []);

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
