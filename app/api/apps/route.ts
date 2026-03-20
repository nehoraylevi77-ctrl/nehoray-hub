import { NextResponse } from "next/server";

// Auto-assigns an emoji icon based on app id keywords
function autoIcon(id: string): string {
  const l = id.toLowerCase();
  if (l.includes("mortgage") || l.includes("home") || l.includes("house")) return "🏠";
  if (l.includes("photo") || l.includes("image") || l.includes("pic")) return "📷";
  if (l.includes("note") || l.includes("doc") || l.includes("write")) return "📝";
  if (l.includes("finance") || l.includes("money") || l.includes("bank")) return "💰";
  if (l.includes("chat") || l.includes("msg") || l.includes("message")) return "💬";
  if (l.includes("music") || l.includes("audio") || l.includes("sound")) return "🎵";
  if (l.includes("video") || l.includes("movie") || l.includes("film")) return "🎬";
  if (l.includes("shop") || l.includes("store") || l.includes("market")) return "🛒";
  return "💻";
}

function getApps() {
  const raw = process.env.NEHORAY_CODES ?? "";
  return raw
    .split(",")
    .filter(Boolean)
    .map((entry) => {
      if (entry.includes("|")) {
        // New format: id|icon|passcode|url
        const parts = entry.split("|");
        const id = parts[0].trim().toLowerCase();
        const icon = parts[1]?.trim() || autoIcon(id);
        const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, " ");
        return { id, name, icon };
      } else {
        // Old format: id:url  (passcode = id)
        const idx = entry.indexOf(":");
        const id = entry.slice(0, idx).trim().toLowerCase();
        const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/[-_]/g, " ");
        return { id, name, icon: autoIcon(id) };
      }
    });
}

export async function GET() {
  return NextResponse.json(getApps());
}
