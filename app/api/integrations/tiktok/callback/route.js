import { NextResponse } from "next/server";
import { tiktokService } from "@/integrations/tiktok";
import { connectionRepository } from "@/lib/repositories/connectionRepository";
import { TIKTOK_COOKIE_NAME } from "@/integrations/tiktok/auth/tiktokSession";
import { logger } from "@/lib/logger";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const state = searchParams.get("state");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin || "https://radar-nine-liard.vercel.app";

  // Check if TikTok returned an authorization error (e.g. user cancelled or sandbox mismatch)
  if (error) {
    logger.warn("TikTok OAuth returned error in callback", { error, errorDescription, state });
    const redirectTarget = new URL("/tiktok", baseUrl);
    redirectTarget.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(redirectTarget.toString());
  }

  if (!code) {
    logger.error("No authorization code provided in TikTok callback");
    const redirectTarget = new URL("/tiktok", baseUrl);
    redirectTarget.searchParams.set("error", "Missing authorization code from TikTok callback.");
    return NextResponse.redirect(redirectTarget.toString());
  }

  try {
    logger.info("Exchanging TikTok authorization code for credentials...");
    await tiktokService.handleOAuthCallback(code);

    const redirectTarget = new URL("/tiktok", baseUrl);
    redirectTarget.searchParams.set("status", "connected");

    const response = NextResponse.redirect(redirectTarget.toString());

    // Attach persistent session cookie so Vercel Serverless Lambdas never lose connection
    const sessionCookie = connectionRepository.generateSessionCookie("tiktok");
    if (sessionCookie) {
      response.cookies.set(TIKTOK_COOKIE_NAME, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (exchangeError) {
    logger.error("Failed to complete TikTok token exchange in callback", exchangeError);
    const redirectTarget = new URL("/tiktok", baseUrl);
    redirectTarget.searchParams.set("error", exchangeError.message || "Failed to exchange TikTok code for token.");
    return NextResponse.redirect(redirectTarget.toString());
  }
}
