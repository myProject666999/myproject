import { NextRequest, NextResponse } from "next/server";
import { renderToSvg } from "@/lib/export";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { latex, displayMode } = (await req.json()) as {
      latex?: string;
      displayMode?: boolean;
    };
    if (!latex) {
      return NextResponse.json({ error: "latex is required" }, { status: 400 });
    }
    const svg = await renderToSvg(latex, displayMode ?? true);
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": 'attachment; filename="formula.svg"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "export failed" }, { status: 500 });
  }
}
