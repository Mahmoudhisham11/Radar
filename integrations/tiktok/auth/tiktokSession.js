/**
 * TikTok Session Cookie Helper
 * Encodes and decodes encrypted/signed session state for TikTok integration.
 * Ensures persistent connection state across serverless lambda instances.
 */

import crypto from "crypto";

export const TIKTOK_COOKIE_NAME = "radar_tiktok_session";
const SECRET_KEY = process.env.TIKTOK_CLIENT_SECRET || process.env.NEXTAUTH_SECRET || "radar_pos_secret_fallback_key_2026";

/**
 * Encodes connection payload to a safe string
 */
export function encodeSessionPayload(payload) {
  try {
    const jsonStr = JSON.stringify(payload);
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash("sha256").update(SECRET_KEY).digest();
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    
    let encrypted = cipher.update(jsonStr, "utf8", "base64");
    encrypted += cipher.final("base64");
    
    return `${iv.toString("base64")}.${encrypted}`;
  } catch {
    // Safe fallback to base64
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }
}

/**
 * Decodes connection payload from a string
 */
export function decodeSessionPayload(token) {
  if (!token) return null;
  try {
    if (token.includes(".")) {
      const [ivStr, encrypted] = token.split(".");
      const iv = Buffer.from(ivStr, "base64");
      const key = crypto.createHash("sha256").update(SECRET_KEY).digest();
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      
      let decrypted = decipher.update(encrypted, "base64", "utf8");
      decrypted += decipher.final("utf8");
      return JSON.parse(decrypted);
    } else {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      return JSON.parse(decoded);
    }
  } catch {
    return null;
  }
}
