import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (!id) {
      return NextResponse.json({ error: '无效的网站ID' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM websites WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json({ error: '网站不存在' }, { status: 404 });
    }

    db.prepare('UPDATE websites SET view_count = view_count + 1 WHERE id = ?').run(id);
    const website = db.prepare('SELECT * FROM websites WHERE id = ?').get(id);

    return NextResponse.json({ view_count: website.view_count });
  } catch (error) {
    return NextResponse.json({ error: '更新浏览量失败' }, { status: 500 });
  }
}
