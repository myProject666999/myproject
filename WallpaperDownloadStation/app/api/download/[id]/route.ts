import { NextRequest, NextResponse } from 'next/server';
import { getWallpaperById, incrementDownloads } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const { searchParams } = new URL(request.url);
  const resolution = searchParams.get('resolution');

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

    let downloadUrl = wallpaper.original_url;
    let downloadWidth = wallpaper.original_width;
    let downloadHeight = wallpaper.original_height;

    if (resolution && wallpaper.sizes) {
      const size = wallpaper.sizes.find(s => s.resolution_label === resolution);
      if (size) {
        downloadUrl = size.url;
        downloadWidth = size.width;
        downloadHeight = size.height;
      }
    }

    incrementDownloads(id).catch(() => {});

    const fileName = `${wallpaper.title || 'wallpaper'}_${downloadWidth}x${downloadHeight}.${wallpaper.file_format || 'jpg'}`;

    return NextResponse.json({
      success: true,
      data: {
        url: downloadUrl,
        width: downloadWidth,
        height: downloadHeight,
        fileName,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to prepare download' },
      { status: 500 }
    );
  }
}
