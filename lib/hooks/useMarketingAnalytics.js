"use client";

import { useState, useMemo } from "react";
import { useTikTokVideos } from "./useTikTokRealtime";
import { marketingAnalyticsEngine, TIME_PERIODS } from "@/lib/analytics/marketingAnalyticsEngine";

/**
 * Realtime Marketing Analytics Hook
 * Automatically computes deterministic analytics from live Firestore video data.
 */
export function useMarketingAnalytics(initialPeriod = TIME_PERIODS.ALL) {
  const { videos, loading: videosLoading, error, refetch } = useTikTokVideos();
  const [period, setPeriod] = useState(initialPeriod);

  const analytics = useMemo(() => {
    return marketingAnalyticsEngine.calculateAnalytics(videos, { period });
  }, [videos, period]);

  return {
    analytics,
    period,
    setPeriod,
    videos,
    loading: videosLoading,
    error,
    refetch,
  };
}
