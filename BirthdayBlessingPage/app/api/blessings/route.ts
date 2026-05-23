import { NextResponse } from 'next/server';
import { getBlessings, addBlessing } from '@/lib/database';

export async function GET() {
  try {
    const blessings = await getBlessings();
    return NextResponse.json({ success: true, data: blessings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, message, avatarColor } = await request.json();

    if (!name || !message) {
      return NextResponse.json(
        { success: false, error: '姓名和祝福内容不能为空' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, error: '姓名不能超过100个字符' },
        { status: 400 }
      );
    }

    const blessing = await addBlessing(name, message, avatarColor || '#f472b6');
    return NextResponse.json({ success: true, data: blessing });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
