import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies(); // <-- важно: await
  cookieStore.delete("wild_session");
  cookieStore.delete("wild_user");
  return NextResponse.json({ ok: true });
}
