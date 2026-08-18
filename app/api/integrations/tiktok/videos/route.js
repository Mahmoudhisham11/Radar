import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxCount = parseInt(searchParams.get("max_count") || "20", 10);
    const cursor = parseInt(searchParams.get("cursor") || "0", 10);

    const result = await tiktokService.getVideos(maxCount, cursor);
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error retrieving TikTok videos", error);
    return NextResponse.json(
      {
        videos: [],
        hasMore: false,
        cursor: 0,
        error: error.message || "Failed to retrieve TikTok videos.",
      },
      { status: 500 }
    );
  }
}
