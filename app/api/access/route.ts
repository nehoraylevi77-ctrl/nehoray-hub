import { NextRequest, NextResponse } from "next/server";

// Supported formats in NEHORAY_CODES env (comma-separated):
//   New format (recommended): id|icon|passcode|url
//   Old format (compat):      id:url   (passcode defaults to id)
//
// Example:
//   NEHORAY_CODES=mortgage|🏠|secret123|https://myapp.com,photos|📷|photopass|https://photos.com
function getEntries(): Record<string, { url: string; passcode: string }> {
  const raw = process.env.NEHORAY_CODES ?? "";
  const result: Record<string, { url: string; passcode: string }> = {};

  raw
    .split(",")
    .filter(Boolean)
    .forEach((entry) => {
      if (entry.includes("|")) {
        const parts = entry.split("|");
        const id = parts[0].trim().toLowerCase();
        const passcode = parts[2]?.trim() ?? id;
        const url = parts[3]?.trim() ?? "";
        if (id && url) result[id] = { url, passcode };
      } else {
        const idx = entry.indexOf(":");
        const id = entry.slice(0, idx).trim().toLowerCase();
        const url = entry.slice(idx + 1).trim();
        if (id && url) result[id] = { url, passcode: id };
      }
    });

  return result;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entries = getEntries();

  // New per-app format: { app, passcode }
  if (body.app !== undefined) {
    const app = String(body.app).toLowerCase().trim();
    const passcode = String(body.passcode ?? "").trim();
    const entry = entries[app];
    if (!entry || entry.passcode.toLowerCase() !== passcode.toLowerCase()) {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }
    return NextResponse.json({ url: entry.url });
  }

  // Legacy format: { code }
  const code = String(body.code ?? "").toLowerCase().trim();
  const entry = entries[code];
  if (!entry) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  return NextResponse.json({ url: entry.url });
}
