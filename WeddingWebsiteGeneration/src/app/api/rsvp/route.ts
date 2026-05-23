import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rsvps = await prisma.rSVP.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(rsvps);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch RSVPs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weddingId, ...data } = body;

    const rsvp = await prisma.rSVP.create({
      data: {
        ...data,
        wedding: {
          connect: { id: weddingId || 1 },
        },
      },
    });

    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create RSVP' },
      { status: 500 }
    );
  }
}
