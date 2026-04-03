import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = !!process.env.RESEND_API_KEY;
  const yourEmail = process.env.YOUR_EMAIL ?? "NOT SET";

  return NextResponse.json({
    RESEND_API_KEY_set: hasApiKey,
    YOUR_EMAIL: yourEmail,
  });
}
