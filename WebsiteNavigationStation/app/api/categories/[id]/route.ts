import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, icon, sort_order } = body;
    const id = parseInt(params.id);

    if (!id) {
      return NextResponse.json({ error: '无效的分类ID' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
      }
      updates.push('name = ?');
      values.push(name.trim());
    }

    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }

    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(sort_order);
    }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (!id) {
      return NextResponse.json({ error: '无效的分类ID' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}
