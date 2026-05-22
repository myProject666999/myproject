import { NextRequest, NextResponse } from 'next/server';
import { getWallpapers } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');
  const categoryId = searchParams.get('categoryId');
  const resolution = searchParams.get('resolution');
  const sort = searchParams.get('sort') as 'latest' | 'popular' | 'downloads' | 'random' | undefined;
  const featured = searchParams.get('featured') === 'true';
  const search = searchParams.get('search') || undefined;

  try {
    const result = await getWallpapers({
      page,
      pageSize,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      resolution: resolution || undefined,
      sort,
      featured,
      search,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallpapers' },
      { status: 500 }
    );
  }
}
