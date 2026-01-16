import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    hasChannel: Boolean(process.env.TELEGRAM_CHANNEL_ID),
  });
}
