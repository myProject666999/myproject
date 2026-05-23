import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID不能为空' },
        { status: 400 }
      );
    }

    const result: any = await query(
      'DELETE FROM history WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除历史记录失败:', error);
    return NextResponse.json(
      { error: '删除历史记录失败' },
      { status: 500 }
    );
  }
}
