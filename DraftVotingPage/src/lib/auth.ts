import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const SESSION_COOKIE = "dv_session";

export async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const [row] = await query(
      "SELECT id, phone, nickname, avatar FROM users WHERE id = ? LIMIT 1",
      [Number(token)]
    );
    return row ?? null;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: NextResponse, userId: number | string) {
  res.cookies.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
