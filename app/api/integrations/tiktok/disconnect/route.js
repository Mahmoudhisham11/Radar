import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const result = await tiktokService.disconnect();
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error disconnecting TikTok integration", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to disconnect TikTok.",
      },
      { status: 500 }
    );
  }
}
