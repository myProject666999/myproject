import { NextRequest, NextResponse } from 'next/server';
import { getFeedItems } from '@/lib/services/feedService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const params = {
    sourceType: searchParams.get('sourceType')?.split(',').filter(Boolean) || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'publishedAt_desc',
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || '20'),
    readLaterOnly: searchParams.get('readLaterOnly') === 'true'
  };

  try {
    const result = getFeedItems(params);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
