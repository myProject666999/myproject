import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, clearAuthCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  return NextResponse.json({ ok: true, user: user ?? null });
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  clearAuthCookie(res);
  return res;
}
