import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 * Used by Vercel and any monitoring service to confirm the app is alive.
 * Returns 200 with basic build info.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "arcswap",
    timestamp: new Date().toISOString(),
  });
}
