import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getRedis } from "@/lib/redis";
import { ymd } from "@/lib/util";

const DAILY_FREE_AMOUNT = 10;

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, reason: "请先登录" }, { status: 401 });
  }
  const date = ymd();
  const [existing] = await query(
    "SELECT id FROM free_tickets WHERE user_id = ? AND date = ?",
    [user.id, date]
  );
  if (existing) {
    return NextResponse.json(
      { ok: false, reason: "今日已领取过免费票" },
      { status: 409 }
    );
  }
  await query(
    "INSERT INTO free_tickets (user_id, date, amount) VALUES (?, ?, ?)",
    [user.id, date, DAILY_FREE_AMOUNT]
  );
  return NextResponse.json({ ok: true, amount: DAILY_FREE_AMOUNT, date });
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, reason: "请先登录" }, { status: 401 });
  }
  const date = ymd();
  const [existing] = await query(
    "SELECT amount FROM free_tickets WHERE user_id = ? AND date = ?",
    [user.id, date]
  );
  const total = existing?.amount ?? 0;
  const redis = getRedis();
  const used = Number((await redis.get(`vote:free:${user.id}:${date}`)) ?? "0");
  const remaining = Math.max(0, total - used);
  return NextResponse.json({
    ok: true,
    total,
    used,
    remaining,
    claimed: !!existing,
    daily: DAILY_FREE_AMOUNT,
  });
}
