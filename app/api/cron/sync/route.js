import { NextResponse } from "next/server";
import { tiktokSyncEngine } from "@/integrations/tiktok";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * 15-Minute Automated Synchronization Cron Endpoint
 * Invoked by external cron services or Vercel Cron.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const secretKey = process.env.CRON_SECRET;

  // Verify cron secret if configured
  if (secretKey && authHeader !== `Bearer ${secretKey}` && searchParams.get("key") !== secretKey) {
    return NextResponse.json({ error: "Unauthorized cron trigger." }, { status: 401 });
  }

  try {
    logger.info("Executing scheduled 15-minute TikTok sync cron...");
    const result = await tiktokSyncEngine.syncAllTikTokData("scheduled_cron_15min");
    return NextResponse.json({ success: true, result });
  } catch (error) {
    logger.error("Error executing automated sync cron", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Automated sync cron failed.",
      },
      { status: 500 }
    );
  }
}
