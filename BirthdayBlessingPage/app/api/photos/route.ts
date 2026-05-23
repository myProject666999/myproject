import { NextResponse } from 'next/server';
import { getPhotos } from '@/lib/database';

export async function GET() {
  try {
    const photos = await getPhotos();
    return NextResponse.json({ success: true, data: photos });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
