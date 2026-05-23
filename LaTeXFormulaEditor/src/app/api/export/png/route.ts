import { NextRequest, NextResponse } from "next/server";
import { renderToPng } from "@/lib/export";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { latex, displayMode, bg } = (await req.json()) as {
      latex?: string;
      displayMode?: boolean;
      bg?: string;
    };
    if (!latex) {
      return NextResponse.json({ error: "latex is required" }, { status: 400 });
    }
    const buf = await renderToPng(latex, { displayMode, bg });
    return new NextResponse(Buffer.from(buf), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="formula.png"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "export failed" }, { status: 500 });
  }
}
