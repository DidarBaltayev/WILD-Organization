import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.return_to": `${base}/api/auth/steam-callback`,
    "openid.realm": base,
  });

  return NextResponse.redirect(
    `https://steamcommunity.com/openid/login?${params.toString()}`
  );
}
