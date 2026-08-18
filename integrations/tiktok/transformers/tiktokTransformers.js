/**
 * TikTok Data Transformers
 * Normalizes raw TikTok Sandbox / API payloads into internal RADAR models.
 * Handles null/partial fields safely without injecting fake metrics.
 */

export function transformTikTokProfile(rawUser) {
  if (!rawUser) return null;

  return {
    id: rawUser.open_id || rawUser.union_id || "primary",
    username: rawUser.display_name || rawUser.username || "TikTok Sandbox User",
    displayName: rawUser.display_name || "",
    avatarUrl: rawUser.avatar_url || rawUser.avatar_large_url || "",
    profileDeepLink: rawUser.profile_deep_link || "",
    followerCount: typeof rawUser.follower_count === "number" ? rawUser.follower_count : 0,
    followingCount: typeof rawUser.following_count === "number" ? rawUser.following_count : 0,
    likesCount: typeof rawUser.likes_count === "number" ? rawUser.likes_count : 0,
    videoCount: typeof rawUser.video_count === "number" ? rawUser.video_count : 0,
    bioDescription: rawUser.bio_description || "",
    isVerified: Boolean(rawUser.is_verified),
    syncedAt: new Date().toISOString(),
  };
}

export function transformTikTokVideo(rawVideo) {
  if (!rawVideo) return null;

  const views = Number(rawVideo.view_count ?? rawVideo.views ?? 0);
  const likes = Number(rawVideo.like_count ?? rawVideo.likes ?? 0);
  const comments = Number(rawVideo.comment_count ?? rawVideo.comments ?? 0);
  const shares = Number(rawVideo.share_count ?? rawVideo.shares ?? 0);

  const totalInteractions = likes + comments + shares;
  const engagementRate = views > 0 ? (totalInteractions / views) * 100 : 0;

  return {
    id: String(rawVideo.id || rawVideo.video_id || `vid_${Date.now()}`),
    title: rawVideo.title || rawVideo.video_description || "Untitled TikTok Video",
    coverImageUrl: rawVideo.cover_image_url || "",
    shareUrl: rawVideo.share_url || "",
    duration: Number(rawVideo.duration) || 0,
    publishTime: rawVideo.create_time
      ? new Date(rawVideo.create_time * 1000).toISOString()
      : new Date().toISOString(),
    metrics: {
      views,
      likes,
      comments,
      shares,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
    },
    syncedAt: new Date().toISOString(),
  };
}
