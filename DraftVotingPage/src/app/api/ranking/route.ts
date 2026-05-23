import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const rows = await query(
    "SELECT id, name, avatar, color, total_votes FROM contestants ORDER BY total_votes DESC, id ASC LIMIT 50"
  );
  return NextResponse.json({ ok: true, data: rows });
}
