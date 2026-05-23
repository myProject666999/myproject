import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const pool = getPool();
  try {
    const [templates]: any[] = await pool.execute(
      'SELECT * FROM templates ORDER BY is_default DESC, created_at DESC'
    );
    return NextResponse.json({ success: true, templates: templates as any[] });
  } catch (error: any) {
    console.error('GET /api/templates error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function POST(req: NextRequest) {
  const pool = getPool();
  try {
    const body = await req.json();

    const [result]: any[] = await pool.execute(
      `INSERT INTO templates (name, type, text_content, logo_path, position, opacity, font_size, font_color, margin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.type,
        body.text_content || null,
        body.logo_path || null,
        body.position || 'bottom-right',
        body.opacity || 1.0,
        body.font_size || 24,
        body.font_color || 'rgba(255, 255, 255, 0.8)',
        body.margin || 20,
      ]
    );

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error: any) {
    console.error('POST /api/templates error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function PUT(req: NextRequest) {
  const pool = getPool();
  try {
    const body = await req.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少模板ID' }, { status: 400 });
    }

    const sets: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updateFields)) {
      sets.push(`${key} = ?`);
      values.push(value);
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: '没有更新字段' }, { status: 400 });
    }

    values.push(id);
    await pool.execute(`UPDATE templates SET ${sets.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PUT /api/templates error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function DELETE(req: NextRequest) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少模板ID' }, { status: 400 });
    }

    await pool.execute('DELETE FROM templates WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/templates error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
