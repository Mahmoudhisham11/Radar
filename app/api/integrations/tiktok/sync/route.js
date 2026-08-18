import { NextResponse } from "next/server";
import { tiktokSyncEngine } from "@/integrations/tiktok";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await tiktokSyncEngine.getSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    logger.error("Error retrieving sync status", error);
    return NextResponse.json(
      { status: "error", error: error.message || "Failed to retrieve sync status." },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await tiktokSyncEngine.syncAllTikTokData("manual");
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error executing TikTok synchronization", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to execute TikTok sync.",
      },
      { status: 500 }
    );
  }
}
