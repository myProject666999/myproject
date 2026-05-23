import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/services/feedService';

export async function POST(request: NextRequest) {
  try {
    const { type, config } = await request.json();
    
    if (!type) {
      return NextResponse.json(
        { success: false, error: '源类型不能为空' },
        { status: 400 }
      );
    }

    const result = await testConnection(type, config || {});
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
