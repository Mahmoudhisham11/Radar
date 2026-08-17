/**
 * OpenRouter AI Adapter (Server-Side Only)
 * Abstracts LLM interactions and function calling.
 */

import { logger } from "@/lib/logger";

export class OpenRouterAdapter {
  constructor(apiKey = process.env.OPENROUTER_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = "https://openrouter.ai/api/v1";
    this.defaultModel = process.env.OPENROUTER_DEFAULT_MODEL || "anthropic/claude-3.5-sonnet";
  }

  async generateCompletion({ messages, tools = [], model, temperature = 0.2, responseFormat }) {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured in OPENROUTER_API_KEY.");
    }

    const timer = logger.startTimer("OpenRouterAdapter.generateCompletion", { model: model || this.defaultModel });

    try {
      const payload = {
        model: model || this.defaultModel,
        messages,
        temperature,
      };

      if (tools && tools.length > 0) {
        payload.tools = tools;
      }

      if (responseFormat) {
        payload.response_format = responseFormat;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "RADAR Marketing Intelligence",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      timer.end("success");
      return result;
    } catch (error) {
      timer.error(error);
      throw error;
    }
  }
}

export const openRouter = new OpenRouterAdapter();
