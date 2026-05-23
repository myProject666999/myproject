import { NextResponse } from 'next/server';
import { getActiveMusic } from '@/lib/database';

export async function GET() {
  try {
    const music = await getActiveMusic();
    return NextResponse.json({ success: true, data: music });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
