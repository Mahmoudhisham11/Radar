import { NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analyticsService";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";

    const analytics = await analyticsService.getMarketingAnalytics(period);
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    logger.error("Error in marketing analytics API route", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate marketing analytics" },
      { status: 500 }
    );
  }
}
