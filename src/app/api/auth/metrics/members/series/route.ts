import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export async function GET() {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    return NextResponse.json(
      { error: "ENV_NOT_FOUND" },
      { status: 500 }
    );
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${CHANNEL_ID}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!data.ok) {
    return NextResponse.json(
      { error: data },
      { status: 500 }
    );
  }

  return NextResponse.json({
    count: data.result,
    updatedAt: Date.now(),
  });
}

