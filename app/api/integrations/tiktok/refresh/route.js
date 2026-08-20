import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { connectionRepository } from "@/lib/repositories/connectionRepository";
import { TIKTOK_COOKIE_NAME } from "@/integrations/tiktok/auth/tiktokSession";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const result = await tiktokService.refreshConnection();
    const response = NextResponse.json(result);

    const sessionCookie = connectionRepository.generateSessionCookie("tiktok");
    if (sessionCookie) {
      response.cookies.set(TIKTOK_COOKIE_NAME, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
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
