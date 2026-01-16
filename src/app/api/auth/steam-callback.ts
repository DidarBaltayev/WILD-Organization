import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function extractSteamId(claimed: string | null): string | null {
  if (!claimed) return null;
  const m = claimed.match(/(\d{17})$/);
  return m ? m[1] : null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);

  // проверяем подпись у Steam
  const verify = new URLSearchParams();
  for (const [k, v] of params.entries()) verify.append(k, v);
  verify.set("openid.mode", "check_authentication");

  const resp = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verify.toString(),
  });

  const text = await resp.text();
  const valid = /is_valid\s*:\s*true/.test(text);
  if (!valid) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=invalid`);
  }

  const steamId = extractSteamId(params.get("openid.claimed_id"));
  if (!steamId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=noid`);
  }

  // (опционально) подтянуть ник
  let persona = `steam:${steamId}`;
  try {
    const key = process.env.STEAM_API_KEY;
    if (key) {
      const data = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`,
        { cache: "no-store" }
      ).then(r => r.json());
      const player = data?.response?.players?.[0];
      if (player?.personaname) persona = player.personaname;
    }
  } catch { /* ignore */ }

  const cookieStore = await cookies(); // <-- важно: await
  const secure = false; // на проде: true + HTTPS
  cookieStore.set("wild_session", `steam:${steamId}`, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  cookieStore.set("wild_user", persona, {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
  });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`);
}
