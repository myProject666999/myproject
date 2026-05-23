import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await query(
      "SELECT id, content, created_at FROM qrcode_history ORDER BY created_at DESC LIMIT 20"
    );

    return NextResponse.json({
      success: true,
      history: rows,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "获取历史记录失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content,
      qr_color,
      bg_color,
      error_level,
      dot_style,
      logo_data,
      logo_size,
      margin,
      width,
      qr_image,
    } = body;

    if (!content || !qr_image) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const [result] = await query(
      `INSERT INTO qrcode_history 
       (content, qr_color, bg_color, error_level, dot_style, logo_data, logo_size, margin, width, qr_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        content,
        qr_color || "#000000",
        bg_color || "#ffffff",
        error_level || "M",
        dot_style || "square",
        logo_data || null,
        logo_size || 0.2,
        margin || 2,
        width || 300,
        qr_image,
      ]
    );

    return NextResponse.json({
      success: true,
      id: (result as { insertId: number }).insertId,
      message: "保存成功",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "保存失败" },
      { status: 500 }
    );
  }
}
