import { NextRequest, NextResponse } from "next/server";
import { renderTex } from "@/lib/mathjax";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { latex, displayMode } = (await req.json()) as {
      latex?: string;
      displayMode?: boolean;
    };
    if (typeof latex !== "string" || !latex) {
      return NextResponse.json(
        { error: "latex is required" },
        { status: 400 }
      );
    }
    const { html, svg } = await renderTex(latex, displayMode ?? true);
    return NextResponse.json({ html, svg });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "render failed" }, { status: 500 });
  }
}
