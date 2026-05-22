import { NextRequest, NextResponse } from 'next/server';
import { getAvailableResolutions } from '@/lib/queries';

export async function GET() {
  try {
    const resolutions = await getAvailableResolutions();
    return NextResponse.json({ success: true, data: resolutions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resolutions' },
      { status: 500 }
    );
  }
}
