import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const templates = await query(
      'SELECT * FROM templates WHERE id = ?',
      [id]
    );
    
    if (!templates || (templates as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: (templates as any[])[0],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: '获取模板详情失败' },
      { status: 500 }
    );
  }
}
