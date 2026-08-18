import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const result = await tiktokService.refreshConnection();
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error refreshing TikTok access token", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to refresh TikTok access token.",
      },
      { status: 400 }
    );
  }
}
