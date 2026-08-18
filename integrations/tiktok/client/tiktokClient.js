/**
 * TikTok API Client (Server-side Only)
 * Handles authenticated requests, rate-limiting, retries with exponential backoff,
 * timeout abortion, error envelopes, and logging.
 */

import { logger } from "@/lib/logger";

export class TikTokClient {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.timeoutMs = 12000;
  }

  async request(url, options = {}) {
    const timer = logger.startTimer("TikTokClient.request", { url });
    const headers = {
      "Content-Type": "application/json",
      ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      ...options.headers,
    };

    let attempts = 0;
    const maxRetries = options.retries ?? 2;

    while (attempts <= maxRetries) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const textBody = await response.text();
        let data = {};
        try {
          data = JSON.parse(textBody);
        } catch {
          data = { raw: textBody };
        }

        if (!response.ok) {
          const errorMsg = data?.error?.message || data?.message || `TikTok API HTTP ${response.status}: ${textBody}`;
          throw new Error(errorMsg);
        }

        // TikTok API envelope check
        if (data.error && data.error.code && data.error.code !== "ok" && data.error.code !== 0) {
          throw new Error(`TikTok API error [${data.error.code}]: ${data.error.message || "Unknown error"}`);
        }

        timer.end("success");
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        const isAbort = error.name === "AbortError";
        const formattedError = isAbort ? new Error(`TikTok API request timed out after ${this.timeoutMs}ms`) : error;

        if (attempts > maxRetries) {
          timer.error(formattedError, { attempts, url });
          throw formattedError;
        }

        // Exponential backoff delay: 500ms, 1000ms...
        const delay = Math.pow(2, attempts) * 500;
        logger.warn(`Retrying TikTok API request after ${delay}ms...`, { url, attempt: attempts, error: formattedError.message });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
