import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { incrWithLimit, getRedis } from "@/lib/redis";
import { clientIp, ymd } from "@/lib/util";
import { z } from "zod";

const schema = z.object({
  contestantId: z.number().int().positive(),
  count: z.number().int().min(1).max(50),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, reason: "请先登录" }, { status: 401 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "请求体解析失败" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { contestantId, count } = parsed.data;
  const [contestant] = await query(
    "SELECT id FROM contestants WHERE id = ? LIMIT 1",
    [contestantId]
  );
  if (!contestant) {
    return NextResponse.json({ ok: false, reason: "选手不存在" }, { status: 404 });
  }

  const ip = clientIp(req);
  const now = new Date();
  const minute = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  const ipLimit = await incrWithLimit(`rate:ip:${ip}`, 30, 30);
  if (!ipLimit.ok) {
    return NextResponse.json(
      { ok: false, reason: "IP 限流中，请稍后再试" },
      { status: 429 }
    );
  }
  const phoneMinLimit = await incrWithLimit(`rate:phone:min:${user.phone}:${minute}`, 60, 50);
  if (!phoneMinLimit.ok) {
    return NextResponse.json(
      { ok: false, reason: "手机号分钟级限流中" },
      { status: 429 }
    );
  }
  const phoneDayLimit = await incrWithLimit(
    `rate:phone:day:${user.phone}:${ymd()}`,
    86400,
    500
  );
  if (!phoneDayLimit.ok) {
    return NextResponse.json(
      { ok: false, reason: "今日投票已达上限" },
      { status: 429 }
    );
  }

  const redis = getRedis();
  const freeKey = `vote:free:${user.id}:${ymd()}`;
  const usedFree = Number((await redis.get(freeKey)) ?? "0");
  const [existingFree] = await query(
    "SELECT amount FROM free_tickets WHERE user_id = ? AND date = ?",
    [user.id, ymd()]
  );
  const totalFreeToday = existingFree?.amount ?? 0;
  const remainingFree = totalFreeToday - usedFree;

  let deductFree = 0;
  if (remainingFree >= count) {
    deductFree = count;
  } else {
    deductFree = remainingFree;
  }
  if (deductFree > 0) {
    await redis.incrby(freeKey, deductFree);
    await redis.expire(freeKey, 86400);
  }

  await query(
    "INSERT INTO votes (user_id, contestant_id, count, ip) VALUES (?, ?, ?, ?)",
    [user.id, contestantId, count, ip]
  );
  await query(
    "UPDATE contestants SET total_votes = total_votes + ? WHERE id = ?",
    [count, contestantId]
  );
  const [updated] = await query(
    "SELECT total_votes FROM contestants WHERE id = ? LIMIT 1",
    [contestantId]
  );

  return NextResponse.json({
    ok: true,
    remaining: Math.max(0, remainingFree - deductFree),
    totalOfContestant: updated.total_votes,
  });
}
