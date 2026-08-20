import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tiktokService } from "@/integrations/tiktok";
import { TIKTOK_COOKIE_NAME } from "@/integrations/tiktok/auth/tiktokSession";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(TIKTOK_COOKIE_NAME)?.value || null;
    const status = await tiktokService.getConnectionStatus(sessionCookie);
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
