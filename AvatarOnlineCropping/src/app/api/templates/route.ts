import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  try {
    let sql = 'SELECT * FROM templates WHERE 1=1';
    const params: any[] = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY id ASC';
    
    const templates = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: '获取模板列表失败' },
      { status: 500 }
    );
  }
}
