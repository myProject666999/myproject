import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query(
      'SELECT id, title, content, created_at, updated_at FROM history ORDER BY created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const result: any = await query(
      'INSERT INTO history (id, title, content) VALUES (?, ?, ?)',
      [id, title, content]
    );

    const newItem = await query(
      'SELECT id, title, content, created_at, updated_at FROM history WHERE id = ?',
      [id]
    );

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error('保存历史记录失败:', error);
    return NextResponse.json(
      { error: '保存历史记录失败' },
      { status: 500 }
    );
  }
}
