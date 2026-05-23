import { NextResponse } from "next/server";
import { getScript, updateScript, deleteScript } from "@/services/scripts";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = Number(id);
  if (!Number.isInteger(parsed)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const item = await getScript(parsed);
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data: item });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = Number(id);
  if (!Number.isInteger(parsed)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const body = await req.json();
  const patch: { title?: string; content?: string } = {};
  if (body.title !== undefined) patch.title = String(body.title).slice(0, 255);
  if (body.content !== undefined) patch.content = String(body.content);
  const ok = await updateScript(parsed, patch);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data: { id: parsed } });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = Number(id);
  if (!Number.isInteger(parsed)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const ok = await deleteScript(parsed);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
