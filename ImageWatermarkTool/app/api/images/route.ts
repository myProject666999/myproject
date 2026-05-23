import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('imageId');
    const type = searchParams.get('type');

    if (!imageId) {
      return NextResponse.json({ error: '缺少图片ID' }, { status: 400 });
    }

    const [images]: any[] = await pool.execute(
      'SELECT * FROM images WHERE id = ?',
      [imageId]
    );

    const imageList = images as any[];
    if (imageList.length === 0) {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 });
    }

    const image = imageList[0];
    const filePath = type === 'watermarked' && image.watermarked_path
      ? image.watermarked_path
      : image.original_path;

    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
      },
    });
  } catch (error: any) {
    console.error('Serve image error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
