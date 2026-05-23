import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const categories = db
    .prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC')
    .all();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon = '📁', sort_order = 0 } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)')
      .run(name.trim(), icon, sort_order);

    const category = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(result.lastInsertRowid);

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}
