import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 });
    }

    const [images]: any[] = await pool.execute(
      'SELECT * FROM images WHERE task_id = ? AND status = ?',
      [taskId, 'completed']
    );

    const imageList = images as any[];
    if (imageList.length === 0) {
      return NextResponse.json({ error: '没有可下载的图片' }, { status: 404 });
    }

    const zipName = `watermarked_images_${taskId}.zip`;
    const zipPath = path.join(process.cwd(), 'outputs', `task_${taskId}`, zipName);

    if (!fs.existsSync(path.dirname(zipPath))) {
      fs.mkdirSync(path.dirname(zipPath), { recursive: true });
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    for (const image of imageList) {
      if (image.watermarked_path && fs.existsSync(image.watermarked_path)) {
        archive.file(image.watermarked_path, { name: image.original_filename });
      }
    }

    await new Promise((resolve, reject) => {
      archive.finalize();
      output.on('close', resolve);
      output.on('error', reject);
    });

    const fileBuffer = fs.readFileSync(zipPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message || '下载失败' }, { status: 500 });
  } finally {
    await pool.end();
  }
}
