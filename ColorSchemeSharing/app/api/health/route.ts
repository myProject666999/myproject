import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/initDB';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const initialized = await initDatabase();
    
    const schemes: any[] = await query('SELECT COUNT(*) as count FROM color_schemes');
    
    return NextResponse.json({
      success: true,
      data: {
        initialized,
        schemeCount: schemes[0].count,
        message: '数据库连接成功',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
