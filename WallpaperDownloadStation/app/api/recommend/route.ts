import { NextRequest, NextResponse } from 'next/server';
import { getRandomWallpapers, getFeaturedWallpapers } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'random';
  const limit = parseInt(searchParams.get('limit') || '6');

  try {
    let data;
    if (type === 'featured') {
      data = await getFeaturedWallpapers(limit);
    } else {
      data = await getRandomWallpapers(limit);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
