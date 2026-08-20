import { NextResponse } from "next/server";
import { businessContextService } from "@/lib/services/businessContextService";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await businessContextService.getBusinessContext();
    const isConfigured = businessContextService.isConfigured(context);
    return NextResponse.json({ context, isConfigured });
  } catch (error) {
    logger.error("Error retrieving business context", error);
    return NextResponse.json(
      { error: error.message || "Failed to load business context" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const updated = await businessContextService.updateBusinessContext(body);
    const isConfigured = businessContextService.isConfigured(updated);
    return NextResponse.json({
      success: true,
      context: updated,
      isConfigured,
      message: "تم حفظ سياق النشاط التجاري بنجاح.",
    });
  } catch (error) {
    logger.error("Error saving business context", error);
    return NextResponse.json(
      { error: error.message || "Failed to save business context" },
      { status: 400 }
    );
  }
}
