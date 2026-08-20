/**
 * Marketing Analytics Engine
 * Deterministic mathematical calculation layer for RADAR marketing performance.
 *
 * Core Principle:
 * RAW DATA (Firestore) → ANALYTICS ENGINE → DETERMINISTIC METRICS → FUTURE AI
 *
 * Formula Documentation:
 * - Channel Engagement Rate = ((totalLikes + totalComments + totalShares) / totalViews) * 100
 * - Video Engagement Rate = ((videoLikes + videoComments + videoShares) / videoViews) * 100
 * - Average Metric = totalMetric / videoCount
 * - Average Days Between Posts = spanDays / (videoCount - 1) (when videoCount >= 2)
 * - Average Videos Per Week = (videoCount / spanDays) * 7 (when spanDays >= 1)
 */

export const TIME_PERIODS = {
  P7D: "7d",
  P30D: "30d",
  P90D: "90d",
  ALL: "all",
};

export class MarketingAnalyticsEngine {
  /**
   * Evaluates all marketing metrics for a given set of videos and period.
   *
   * @param {Array<Object>} allVideos - Full array of normalized videos from Firestore
   * @param {Object} options - Configuration options
   * @param {string} options.period - "7d" | "30d" | "90d" | "all" (default "all")
   * @param {Date} [options.now] - Current reference date for testing
   * @returns {Object} Structured normalized analytics result
   */
  calculateAnalytics(allVideos = [], options = {}) {
    const period = options.period || TIME_PERIODS.ALL;
    const now = options.now instanceof Date ? options.now : new Date();

    // 1. Calculate Period Boundaries
    const periodFilter = this.getPeriodFilter(period, now);
    const filteredVideos = this.filterVideosByPeriod(allVideos, periodFilter);

    // 2. Aggregate Raw Metrics
    const rawMetrics = this.computeRawMetrics(filteredVideos);

    // 3. Compute Averages & Rates
    const count = filteredVideos.length;
    const views = {
      total: rawMetrics.totalViews,
      average: count > 0 ? Math.round(rawMetrics.totalViews / count) : 0,
      highest: rawMetrics.highestViewedVideo,
      lowest: rawMetrics.lowestViewedVideo,
    };

    const likes = {
      total: rawMetrics.totalLikes,
      average: count > 0 ? Number((rawMetrics.totalLikes / count).toFixed(1)) : 0,
    };

    const comments = {
      total: rawMetrics.totalComments,
      average: count > 0 ? Number((rawMetrics.totalComments / count).toFixed(1)) : 0,
    };

    const shares = {
      total: rawMetrics.totalShares,
      average: count > 0 ? Number((rawMetrics.totalShares / count).toFixed(1)) : 0,
    };

    // 4. Calculate Deterministic Engagement Rate
    const totalInteractions = rawMetrics.totalLikes + rawMetrics.totalComments + rawMetrics.totalShares;
    const engagementRate =
      rawMetrics.totalViews > 0
        ? Number(((totalInteractions / rawMetrics.totalViews) * 100).toFixed(2))
        : null;

    // 5. Compute Deterministic Rankings
    const rankings = this.computeContentRankings(filteredVideos);

    // 6. Compute Posting Frequency & Pace
    const posting = this.computePostingFrequency(filteredVideos, periodFilter);

    // 7. Compute Trends (Compare current period vs prior equivalent window)
    const trends = this.computeTrends(allVideos, periodFilter, now);

    // 8. Assess Data Quality
    const dataQuality = this.assessDataQuality(allVideos, filteredVideos);

    return {
      period: {
        type: period,
        startDate: periodFilter.startDate ? periodFilter.startDate.toISOString() : null,
        endDate: periodFilter.endDate ? periodFilter.endDate.toISOString() : null,
      },
      content: {
        totalVideosInCatalog: allVideos.length,
        videosPublishedInPeriod: count,
      },
      views,
      likes,
      comments,
      shares,
      engagement: {
        rate: engagementRate, // e.g. 4.85 or null
        rateFormatted: engagementRate !== null ? `${engagementRate}%` : "غير متوفر",
        totalInteractions,
      },
      posting,
      rankings,
      trends,
      dataQuality,
      calculatedAt: now.toISOString(),
    };
  }

  /**
   * Resolves time window boundaries.
   */
  getPeriodFilter(period, now) {
    if (period === TIME_PERIODS.ALL) {
      return { type: TIME_PERIODS.ALL, startDate: null, endDate: now };
    }

    let days = 30;
    if (period === TIME_PERIODS.P7D) days = 7;
    if (period === TIME_PERIODS.P90D) days = 90;

    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      type: period,
      days,
      startDate,
      endDate: now,
    };
  }

  /**
   * Filters videos published within the period window.
   */
  filterVideosByPeriod(videos, periodFilter) {
    if (!videos || !Array.isArray(videos)) return [];
    if (!periodFilter.startDate) return [...videos];

    const startTime = periodFilter.startDate.getTime();
    const endTime = periodFilter.endDate.getTime();

    return videos.filter((video) => {
      const pubTime = this.getVideoTimestamp(video);
      if (!pubTime) return true; // Include if timestamp is missing or untracked
      return pubTime >= startTime && pubTime <= endTime;
    });
  }

  getVideoTimestamp(video) {
    if (!video) return null;
    if (video.publishTime) {
      const t = typeof video.publishTime === "number" ? video.publishTime : new Date(video.publishTime).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (video.createTime) {
      const t = typeof video.createTime === "number" ? video.createTime * 1000 : new Date(video.createTime).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (video.firstSeenAt) {
      const t = new Date(video.firstSeenAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    return null;
  }

  computeRawMetrics(videos) {
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    let highestViewedVideo = null;
    let lowestViewedVideo = null;

    for (const v of videos) {
      const vViews = v.metrics?.views || 0;
      const vLikes = v.metrics?.likes || 0;
      const vComments = v.metrics?.comments || 0;
      const vShares = v.metrics?.shares || 0;

      totalViews += vViews;
      totalLikes += vLikes;
      totalComments += vComments;
      totalShares += vShares;

      if (!highestViewedVideo || vViews > (highestViewedVideo.metrics?.views || 0)) {
        highestViewedVideo = v;
      }
      if (!lowestViewedVideo || vViews < (lowestViewedVideo.metrics?.views || 0)) {
        lowestViewedVideo = v;
      }
    }

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      highestViewedVideo,
      lowestViewedVideo,
    };
  }

  /**
   * Deterministically ranks videos by views, likes, comments, shares, and engagement rate.
   */
  computeContentRankings(videos) {
    if (!videos || videos.length === 0) {
      return {
        byViews: [],
        byLikes: [],
        byComments: [],
        byShares: [],
        byEngagement: [],
      };
    }

    const annotated = videos.map((v) => {
      const vViews = v.metrics?.views || 0;
      const vLikes = v.metrics?.likes || 0;
      const vComments = v.metrics?.comments || 0;
      const vShares = v.metrics?.shares || 0;
      const interactions = vLikes + vComments + vShares;
      const engagementRate = vViews > 0 ? Number(((interactions / vViews) * 100).toFixed(2)) : null;

      return {
        id: v.id,
        title: v.title || "فيديو تيك توك",
        publishTime: v.publishTime,
        views: vViews,
        likes: vLikes,
        comments: vComments,
        shares: vShares,
        engagementRate,
      };
    });

    return {
      byViews: [...annotated].sort((a, b) => b.views - a.views).slice(0, 10),
      byLikes: [...annotated].sort((a, b) => b.likes - a.likes).slice(0, 10),
      byComments: [...annotated].sort((a, b) => b.comments - a.comments).slice(0, 10),
      byShares: [...annotated].sort((a, b) => b.shares - a.shares).slice(0, 10),
      byEngagement: [...annotated]
        .sort((a, b) => {
          if (a.engagementRate === null) return 1;
          if (b.engagementRate === null) return -1;
          return b.engagementRate - a.engagementRate;
        })
        .slice(0, 10),
    };
  }

  /**
   * Calculates posting cadence without inventing historical data.
   */
  computePostingFrequency(videos, periodFilter) {
    if (!videos || videos.length < 2) {
      return {
        status: "insufficient_data",
        message: "يتطلب حساب وتيرة النشر مقطعين على الأقل.",
        averageDaysBetweenPosts: null,
        averageVideosPerWeek: null,
        totalVideosInPeriod: videos ? videos.length : 0,
      };
    }

    const timestamps = videos
      .map((v) => this.getVideoTimestamp(v))
      .filter((t) => typeof t === "number" && t > 0)
      .sort((a, b) => a - b);

    if (timestamps.length < 2) {
      return {
        status: "insufficient_data",
        message: "التواريخ المسجلة غير كافية لحساب وتيرة النشر.",
        averageDaysBetweenPosts: null,
        averageVideosPerWeek: null,
        totalVideosInPeriod: videos.length,
      };
    }

    const earliest = timestamps[0];
    const latest = timestamps[timestamps.length - 1];
    const spanDays = Math.max((latest - earliest) / (1000 * 60 * 60 * 24), 0.1);

    const averageDaysBetweenPosts = Number((spanDays / (timestamps.length - 1)).toFixed(1));
    const averageVideosPerWeek = Number(((timestamps.length / spanDays) * 7).toFixed(1));

    return {
      status: "calculated",
      spanDays: Number(spanDays.toFixed(1)),
      averageDaysBetweenPosts,
      averageVideosPerWeek,
      totalVideosInPeriod: videos.length,
    };
  }

  /**
   * Compares current period performance against prior period to compute trends.
   */
  computeTrends(allVideos, periodFilter, now) {
    if (!periodFilter.days) {
      return {
        views: { direction: "insufficient_data", changePercent: null },
        likes: { direction: "insufficient_data", changePercent: null },
        comments: { direction: "insufficient_data", changePercent: null },
        shares: { direction: "insufficient_data", changePercent: null },
        engagement: { direction: "insufficient_data", changePercent: null },
      };
    }

    const days = periodFilter.days;
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const priorStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

    const currentVideos = allVideos.filter((v) => {
      const t = this.getVideoTimestamp(v);
      return t && t >= currentStart.getTime() && t <= now.getTime();
    });

    const priorVideos = allVideos.filter((v) => {
      const t = this.getVideoTimestamp(v);
      return t && t >= priorStart.getTime() && t < currentStart.getTime();
    });

    if (currentVideos.length === 0 && priorVideos.length === 0) {
      return {
        views: { direction: "insufficient_data", changePercent: null },
        likes: { direction: "insufficient_data", changePercent: null },
        comments: { direction: "insufficient_data", changePercent: null },
        shares: { direction: "insufficient_data", changePercent: null },
        engagement: { direction: "insufficient_data", changePercent: null },
      };
    }

    const currMetrics = this.computeRawMetrics(currentVideos);
    const priorMetrics = this.computeRawMetrics(priorVideos);

    const calcTrend = (currVal, priorVal) => {
      if (priorVal === 0 && currVal === 0) return { direction: "stable", changePercent: 0 };
      if (priorVal === 0 && currVal > 0) return { direction: "up", changePercent: 100 };
      if (priorVal > 0 && currVal === 0) return { direction: "down", changePercent: -100 };

      const diff = currVal - priorVal;
      const changePercent = Number(((diff / priorVal) * 100).toFixed(1));
      let direction = "stable";
      if (changePercent > 1) direction = "up";
      else if (changePercent < -1) direction = "down";

      return { direction, changePercent };
    };

    return {
      views: calcTrend(currMetrics.totalViews, priorMetrics.totalViews),
      likes: calcTrend(currMetrics.totalLikes, priorMetrics.totalLikes),
      comments: calcTrend(currMetrics.totalComments, priorMetrics.totalComments),
      shares: calcTrend(currMetrics.totalShares, priorMetrics.totalShares),
    };
  }

  /**
   * Reports completeness and quality of input data.
   */
  assessDataQuality(allVideos, filteredVideos) {
    if (!allVideos || allVideos.length === 0) {
      return {
        status: "insufficient_data",
        message: "لا توجد فيديوهات في قاعدة البيانات حتى الآن.",
        missingMetrics: [],
        evaluatedCount: 0,
      };
    }

    const missingMetrics = [];
    let hasViews = false;
    let hasLikes = false;
    let hasComments = false;
    let hasShares = false;

    for (const v of allVideos) {
      if (v.metrics?.views !== undefined) hasViews = true;
      if (v.metrics?.likes !== undefined) hasLikes = true;
      if (v.metrics?.comments !== undefined) hasComments = true;
      if (v.metrics?.shares !== undefined) hasShares = true;
    }

    if (!hasViews) missingMetrics.push("views");
    if (!hasLikes) missingMetrics.push("likes");
    if (!hasComments) missingMetrics.push("comments");
    if (!hasShares) missingMetrics.push("shares");

    let status = "complete";
    if (missingMetrics.length > 0) {
      status = "partial";
    }

    return {
      status,
      missingMetrics,
      evaluatedCount: filteredVideos.length,
      totalCatalogCount: allVideos.length,
    };
  }
}

export const marketingAnalyticsEngine = new MarketingAnalyticsEngine();
