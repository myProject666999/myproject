import { NextRequest, NextResponse } from 'next/server';
import { fetchFavicon } from '@/lib/favicon';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL参数不能为空' }, { status: 400 });
  }

  try {
    const faviconUrl = await fetchFavicon(url);
    return NextResponse.json({ favicon_url: faviconUrl });
  } catch (error) {
    return NextResponse.json({ error: '获取favicon失败' }, { status: 500 });
  }
}
