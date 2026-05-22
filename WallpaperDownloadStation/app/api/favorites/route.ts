import { NextRequest, NextResponse } from 'next/server';
import { getFavoritesByUser } from '@/lib/queries';
import { generateUserIdentifier } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';
  const userIdentifier = generateUserIdentifier(ip, userAgent);

  try {
    const favorites = await getFavoritesByUser(userIdentifier);
    return NextResponse.json({ success: true, data: favorites });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}
