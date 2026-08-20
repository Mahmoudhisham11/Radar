import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { TIKTOK_COOKIE_NAME } from "@/integrations/tiktok/auth/tiktokSession";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const result = await tiktokService.disconnect();
    const response = NextResponse.json(result);

    // Delete session cookie
    response.cookies.delete(TIKTOK_COOKIE_NAME);

    return response;
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
