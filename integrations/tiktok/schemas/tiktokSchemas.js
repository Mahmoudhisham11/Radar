/**
 * TikTok Schema Definitions & Internal Model Representations
 */

export const TIKTOK_SCOPES = [
  "user.info.basic",
  "user.info.profile",
  "user.info.stats",
  "video.list",
  "video.insights",
];

export const TIKTOK_ENDPOINTS = {
  AUTH_URL: "https://www.tiktok.com/v2/auth/authorize/",
  TOKEN_URL: "https://open.tiktokapis.com/v2/oauth/token/",
  USER_INFO: "https://open.tiktokapis.com/v2/user/info/",
  VIDEO_LIST: "https://open.tiktokapis.com/v2/video/list/",
  VIDEO_QUERY: "https://open.tiktokapis.com/v2/video/query/",
};
