import { NextRequest, NextResponse } from 'next/server';
import { getAllSources, createSource } from '@/lib/services/feedService';

export async function GET() {
  try {
    const sources = getAllSources();
    return NextResponse.json({ success: true, data: sources });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, config } = await request.json();
    
    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: '名称和类型不能为空' },
        { status: 400 }
      );
    }

    const result = await createSource(name, type, config || {});
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
