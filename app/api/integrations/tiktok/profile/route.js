import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await tiktokService.getProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    logger.error("Error retrieving TikTok profile", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to retrieve TikTok profile.",
      },
      { status: 500 }
    );
  }
}
