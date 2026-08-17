/**
 * TikTok API Client (Server-side Only)
 * Handles authenticated requests, rate-limiting, retries, and network errors.
 */

import { logger } from "@/lib/logger";

export class TikTokClient {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.timeoutMs = 10000;
  }

  async request(endpoint, options = {}) {
    const timer = logger.startTimer("TikTokClient.request", { endpoint });
    const headers = {
      "Content-Type": "application/json",
      ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      ...options.headers,
    };

    let attempts = 0;
    const maxRetries = options.retries || 2;

    while (attempts <= maxRetries) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(endpoint, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`TikTok API HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        
        // Handle TikTok envelope error code if present
        if (data.error && data.error.code !== "ok" && data.error.code !== 0) {
          throw new Error(`TikTok API error [${data.error.code}]: ${data.error.message}`);
        }

        timer.end("success");
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (attempts > maxRetries) {
          timer.error(error, { attempts });
          throw error;
        }
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 500;
        logger.warn(`Retrying TikTok API request after ${delay}ms...`, { endpoint, attempt: attempts });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
