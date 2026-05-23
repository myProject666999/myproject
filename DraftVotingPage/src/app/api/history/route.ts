import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, reason: "请先登录" }, { status: 401 });
  }
  const rows = await query(
    `SELECT v.id, v.count, v.created_at, c.id AS contestant_id, c.name AS contestant_name, c.color AS contestant_color
     FROM votes v JOIN contestants c ON c.id = v.contestant_id
     WHERE v.user_id = ?
     ORDER BY v.created_at DESC
     LIMIT 100`,
    [user.id]
  );
  return NextResponse.json({ ok: true, data: rows });
}
