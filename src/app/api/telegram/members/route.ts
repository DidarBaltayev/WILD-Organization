import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { error: "Telegram env vars not set" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getChatMemberCount?chat_id=${chatId}`,
      { cache: "no-store" }
    );

    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: "Telegram API error", data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: data.result,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Fetch failed", err },
      { status: 500 }
    );
  }
}

