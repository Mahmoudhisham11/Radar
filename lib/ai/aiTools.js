/**
 * AI Tool Definitions for Function Calling
 */

export const RADAR_AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "getBusinessContext",
      description: "Retrieves business positioning, target audience, pricing, and current strategic goals.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "getGoals",
      description: "Retrieves active revenue, customer, lead, and content goals with current progress.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "getTikTokOverview",
      description: "Retrieves current TikTok account stats, follower trajectory, and recent video performance summaries.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "getLeadsPipeline",
      description: "Retrieves leads by stage, recent follow-up status, and conversion drop-offs.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "getMarketingInsights",
      description: "Retrieves recently detected marketing problems, opportunities, and trends.",
      parameters: { type: "object", properties: {} }
    }
  }
];
