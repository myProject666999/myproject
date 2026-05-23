import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT id, latex, title, created_at FROM favorites ORDER BY created_at DESC LIMIT 200"
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "db error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { latex, title } = (await req.json()) as {
      latex?: string;
      title?: string;
    };
    if (!latex) {
      return NextResponse.json({ error: "latex is required" }, { status: 400 });
    }
    const [r] = await pool.query(
      "INSERT INTO favorites (latex, title) VALUES (?, ?)",
      [latex, title || null]
    ) as any[];
    const [row] = await pool.query(
      "SELECT id, latex, title, created_at FROM favorites WHERE id = ?",
      [r.insertId]
    ) as any[];
    return NextResponse.json((row as any[])[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "db error" }, { status: 500 });
  }
}
