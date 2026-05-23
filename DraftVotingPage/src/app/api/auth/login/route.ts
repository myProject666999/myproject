import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  phone: z.string().regex(/^\d{6,15}$/, "手机号格式不正确"),
  code: z.string().length(6, "验证码 6 位"),
});

export async function POST(req: NextRequest) {
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
  const { phone } = parsed.data;
  const [existing] = await query("SELECT id FROM users WHERE phone = ? LIMIT 1", [phone]);
  let userId: number;
  if (existing) {
    userId = existing.id;
  } else {
    const [result] = await query(
      "INSERT INTO users (phone, nickname) VALUES (?, ?)",
      [phone, `粉丝${phone.slice(-4)}`]
    ) as any[];
    userId = result.insertId;
  }
  const [user] = await query(
    "SELECT id, phone, nickname, avatar FROM users WHERE id = ?",
    [userId]
  );
  const res = NextResponse.json({ ok: true, user });
  setAuthCookie(res, userId);
  return res;
}
