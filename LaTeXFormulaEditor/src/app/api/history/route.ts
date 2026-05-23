import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT id, latex, created_at FROM history ORDER BY created_at DESC LIMIT 100"
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "db error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { latex } = (await req.json()) as { latex?: string };
    if (!latex) {
      return NextResponse.json({ error: "latex is required" }, { status: 400 });
    }
    await pool.query("INSERT INTO history (latex) VALUES (?)", [latex]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "db error" }, { status: 500 });
  }
}
