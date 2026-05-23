import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let sql = 'SELECT * FROM templates WHERE is_active = 1';
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY sort_order ASC, id ASC';

    const templates = await query(sql, params);
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      preview_image,
      background_color,
      text_color,
      accent_color,
      font_family,
      layout_type,
      animation_style,
      sort_order,
    } = body;

    const sql = `
      INSERT INTO templates (name, category, preview_image, background_color, text_color, accent_color, font_family, layout_type, animation_style, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result: any = await query(sql, [
      name,
      category,
      preview_image,
      background_color,
      text_color,
      accent_color,
      font_family,
      layout_type,
      animation_style,
      sort_order || 0,
    ]);

    return NextResponse.json({
      success: true,
      data: { id: result.insertId, ...body },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
