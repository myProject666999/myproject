import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, reason: "id 非法" }, { status: 400 });
  }
  const [row] = await query(
    "SELECT id, name, avatar, description, color, total_votes, created_at FROM contestants WHERE id = ? LIMIT 1",
    [id]
  );
  if (!row) {
    return NextResponse.json({ ok: false, reason: "选手不存在" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data: row });
}
