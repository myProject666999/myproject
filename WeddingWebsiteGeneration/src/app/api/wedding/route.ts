import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const wedding = await prisma.wedding.findFirst();
    return NextResponse.json(wedding);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch wedding info' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const wedding = await prisma.wedding.update({
      where: { id: id || 1 },
      data,
    });

    return NextResponse.json(wedding);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update wedding info' },
      { status: 500 }
    );
  }
}
