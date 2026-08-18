import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await tiktokService.getConnectionStatus();
    return NextResponse.json(status);
  } catch (error) {
    logger.error("Error retrieving TikTok connection status", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to retrieve TikTok status.",
      },
      { status: 500 }
    );
  }
}
