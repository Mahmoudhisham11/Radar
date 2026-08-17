/**
 * Structured AI Schemas & Output Types
 * Avoid parsing fragile plain-text by utilizing structured responses.
 */

export const AI_RESPONSE_SCHEMAS = {
  INSIGHT: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["problem", "opportunity", "trend", "recommendation"] },
      severity: { type: "string", enum: ["critical", "warning", "info"] },
      title: { type: "string" },
      summary: { type: "string" },
      evidence: {
        type: "array",
        items: {
          type: "object",
          properties: {
            metric: { type: "string" },
            change: { type: "string" },
            period: { type: "string" },
            context: { type: "string" }
          },
          required: ["metric", "change"]
        }
      },
      recommendedActions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            action: { type: "string" },
            impact: { type: "string" },
            effort: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: ["action"]
        }
      }
    },
    required: ["type", "title", "summary", "evidence", "recommendedActions"]
  }
};
