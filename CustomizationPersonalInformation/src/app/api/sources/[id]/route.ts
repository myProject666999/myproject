import { NextRequest, NextResponse } from 'next/server';
import { getSourceById, updateSource, deleteSource, refreshSource } from '@/lib/services/feedService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const source = getSourceById(params.id);
    if (!source) {
      return NextResponse.json(
        { success: false, error: '源不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: source });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const source = updateSource(params.id, body);
    if (!source) {
      return NextResponse.json(
        { success: false, error: '源不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: source });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteSource(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: '源不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
