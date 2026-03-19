import { NextRequest, NextResponse } from "next/server";

// Format in env: CODE1:url1,CODE2:url2
// Example: NEHORAY_CODES=mortgage:https://mortgage.nehoraylevi.com,photos:https://photos.nehoraylevi.com
function getCodes(): Record<string, string> {
  const raw = process.env.NEHORAY_CODES ?? "";
  return Object.fromEntries(
    raw.split(",")
      .filter(Boolean)
      .map((entry) => {
        const idx = entry.indexOf(":");
        return [entry.slice(0, idx).trim().toLowerCase(), entry.slice(idx + 1).trim()];
      })
  );
}

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const codes = getCodes();
  const url = codes[String(code).toLowerCase().trim()];

  if (!url) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  return NextResponse.json({ url });
}
