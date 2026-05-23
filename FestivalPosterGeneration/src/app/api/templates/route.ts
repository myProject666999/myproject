import { NextResponse } from "next/server";
import { getAllTemplates, getTemplatesByFestivalId } from "@/lib/templates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const festivalId = searchParams.get("festivalId");

  try {
    let templates;
    if (festivalId) {
      templates = await getTemplatesByFestivalId(parseInt(festivalId));
    } else {
      templates = await getAllTemplates();
    }

    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
