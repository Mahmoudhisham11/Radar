import { NextResponse } from "next/server";
import { checkSystemHealth } from "@/lib/services/healthService";

export async function GET() {
  try {
    const health = await checkSystemHealth();
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}
