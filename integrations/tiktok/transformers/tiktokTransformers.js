/**
 * TikTok Data Transformers
 * Normalizes raw TikTok Sandbox / API payloads into internal RADAR models.
 * Handles null/partial fields safely without injecting fake metrics.
 */

export function transformTikTokProfile(rawUser) {
  if (!rawUser) return null;

  return {
    id: rawUser.open_id || rawUser.union_id || rawUser.id || "primary",
    username: rawUser.display_name || rawUser.username || rawUser.nickname || "TikTok Sandbox User",
    displayName: rawUser.display_name || rawUser.nickname || "",
    avatarUrl: rawUser.avatar_url || rawUser.avatar_large_url || rawUser.avatar_thumb || "",
    profileDeepLink: rawUser.profile_deep_link || rawUser.share_url || "",
    followerCount: typeof rawUser.follower_count === "number" ? rawUser.follower_count : (Number(rawUser.followers) || 0),
    followingCount: typeof rawUser.following_count === "number" ? rawUser.following_count : (Number(rawUser.following) || 0),
    likesCount: typeof rawUser.likes_count === "number" ? rawUser.likes_count : (Number(rawUser.likes) || 0),
    videoCount: typeof rawUser.video_count === "number" ? rawUser.video_count : (Number(rawUser.videos) || 0),
    bioDescription: rawUser.bio_description || rawUser.signature || "",
    isVerified: Boolean(rawUser.is_verified),
    syncedAt: new Date().toISOString(),
  };
}

export function transformTikTokVideo(rawVideo) {
  if (!rawVideo) return null;

  const views = Number(rawVideo.view_count ?? rawVideo.views ?? rawVideo.play_count ?? 0);
  const likes = Number(rawVideo.like_count ?? rawVideo.likes ?? rawVideo.digg_count ?? 0);
  const comments = Number(rawVideo.comment_count ?? rawVideo.comments ?? 0);
  const shares = Number(rawVideo.share_count ?? rawVideo.shares ?? 0);

  const totalInteractions = likes + comments + shares;
  const engagementRate = views > 0 ? (totalInteractions / views) * 100 : 0;

  const publishTime = rawVideo.create_time
    ? new Date(rawVideo.create_time * 1000).toISOString()
    : rawVideo.publish_time
    ? new Date(rawVideo.publish_time).toISOString()
    : new Date().toISOString();

  return {
    id: String(rawVideo.id || rawVideo.video_id || rawVideo.item_id || `vid_${Date.now()}`),
    title: rawVideo.title || rawVideo.video_description || rawVideo.desc || rawVideo.caption || "Untitled TikTok Video",
    coverImageUrl: rawVideo.cover_image_url || rawVideo.cover_url || rawVideo.origin_cover || rawVideo.dynamic_cover || "",
    shareUrl: rawVideo.share_url || rawVideo.share_link || rawVideo.web_video_url || "",
    duration: Number(rawVideo.duration || rawVideo.video_duration) || 0,
    publishTime,
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
