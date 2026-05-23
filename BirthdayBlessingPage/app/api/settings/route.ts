import { NextResponse } from 'next/server';
import { getSetting, updateSetting } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: '缺少参数 key' },
        { status: 400 }
      );
    }

    const value = await getSetting(key);
    return NextResponse.json({ success: true, data: { key, value } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: '参数 key 和 value 都不能为空' },
        { status: 400 }
      );
    }

    await updateSetting(key, value);
    return NextResponse.json({ success: true, data: { key, value } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
