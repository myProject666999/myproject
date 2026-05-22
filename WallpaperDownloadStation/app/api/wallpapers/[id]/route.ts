import { NextRequest, NextResponse } from 'next/server';
import { getWallpaperById, incrementViews } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid wallpaper ID' },
      { status: 400 }
    );
  }

  try {
    const wallpaper = await getWallpaperById(id);

    if (!wallpaper) {
      return NextResponse.json(
        { success: false, error: 'Wallpaper not found' },
        { status: 404 }
      );
    }

    incrementViews(id).catch(() => {});

    return NextResponse.json({ success: true, data: wallpaper });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallpaper' },
      { status: 500 }
    );
  }
}
