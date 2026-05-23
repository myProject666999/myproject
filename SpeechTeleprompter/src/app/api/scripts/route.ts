import { NextResponse } from "next/server";
import { listScripts, createScript } from "@/services/scripts";

export async function GET() {
  try {
    const data = await listScripts();
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title ?? "").slice(0, 255) || "未命名稿件";
    const content = String(body.content ?? "");
    const id = await createScript({ title, content });
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}
