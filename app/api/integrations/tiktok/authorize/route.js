import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { logger } from "@/lib/logger";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const returnJson = searchParams.get("json") === "true";
    const state = "radar_csrf_" + Math.random().toString(36).substring(2, 15);

    const authUrl = tiktokService.getAuthorizationUrl(state);

    if (returnJson) {
      return NextResponse.json({ authUrl, state });
    }

    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error("Error generating TikTok authorization URL", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize TikTok authorization." },
      { status: 500 }
    );
  }
}
