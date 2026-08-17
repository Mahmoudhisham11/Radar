/**
 * TikTok Data Transformers
 * Normalizes raw TikTok Sandbox / API payloads into internal RADAR models.
 */

export function transformTikTokProfile(rawUser) {
  if (!rawUser) return null;
  return {
    id: rawUser.open_id || rawUser.union_id || "primary",
    username: rawUser.display_name || rawUser.username || "TikTok User",
    avatarUrl: rawUser.avatar_url || rawUser.avatar_large_url || "",
    followerCount: Number(rawUser.follower_count) || 0,
    followingCount: Number(rawUser.following_count) || 0,
    likesCount: Number(rawUser.likes_count) || 0,
    videoCount: Number(rawUser.video_count) || 0,
    bioDescription: rawUser.bio_description || "",
    isVerified: Boolean(rawUser.is_verified),
    syncedAt: new Date().toISOString(),
  };
}

export function transformTikTokVideo(rawVideo) {
  if (!rawVideo) return null;
  
  const views = Number(rawVideo.view_count || rawVideo.views || 0);
  const likes = Number(rawVideo.like_count || rawVideo.likes || 0);
  const comments = Number(rawVideo.comment_count || rawVideo.comments || 0);
  const shares = Number(rawVideo.share_count || rawVideo.shares || 0);
  
  const totalInteractions = likes + comments + shares;
  const engagementRate = views > 0 ? ((totalInteractions / views) * 100) : 0;

  return {
    id: rawVideo.id || rawVideo.video_id || `vid_${Date.now()}`,
    title: rawVideo.title || rawVideo.video_description || "",
    coverImageUrl: rawVideo.cover_image_url || "",
    shareUrl: rawVideo.share_url || "",
    duration: Number(rawVideo.duration) || 0,
    publishTime: rawVideo.create_time ? new Date(rawVideo.create_time * 1000).toISOString() : new Date().toISOString(),
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
