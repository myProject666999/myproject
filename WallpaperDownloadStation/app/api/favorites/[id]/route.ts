import { NextRequest, NextResponse } from 'next/server';
import { addFavorite, removeFavorite, isFavorited } from '@/lib/queries';
import { generateUserIdentifier } from '@/lib/utils';

function getUserIdentifier(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';
  return generateUserIdentifier(ip, userAgent);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const userIdentifier = getUserIdentifier(request);

  try {
    const favorited = await isFavorited(id, userIdentifier);
    return NextResponse.json({ success: true, data: { is_favorited: favorited } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check favorite' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const userIdentifier = getUserIdentifier(request);

  try {
    const result = await addFavorite(id, userIdentifier);
    if (result) {
      return NextResponse.json({ success: true, data: { is_favorited: true } });
    }
    return NextResponse.json(
      { success: false, error: 'Already favorited' },
      { status: 409 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const userIdentifier = getUserIdentifier(request);

  try {
    const result = await removeFavorite(id, userIdentifier);
    if (result) {
      return NextResponse.json({ success: true, data: { is_favorited: false } });
    }
    return NextResponse.json(
      { success: false, error: 'Not favorited' },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
