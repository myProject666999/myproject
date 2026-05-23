import { NextRequest, NextResponse } from 'next/server';
import { toggleReadLater, getReadLaterItems } from '@/lib/services/feedService';

export async function POST(request: NextRequest) {
  try {
    const { itemId, readLater } = await request.json();
    
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: '项目 ID 不能为空' },
        { status: 400 }
      );
    }

    toggleReadLater(itemId, readLater !== false);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const items = getReadLaterItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
