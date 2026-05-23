import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPool } from '@/lib/db';
import { addWatermark, getImageInfo, WatermarkConfig, WatermarkPosition } from '@/lib/watermark';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const pool = getPool();
  try {
    const body = await req.json();
    const { taskId, config } = body;

    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 });
    }

    const [tasks]: any[] = await pool.execute(
      'SELECT * FROM watermark_tasks WHERE id = ?',
      [taskId]
    );

    if (!tasks || (tasks as any[]).length === 0) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    await pool.execute(
      'UPDATE watermark_tasks SET status = ?, config = ? WHERE id = ?',
      ['processing', JSON.stringify(config), taskId]
    );

    const [images]: any[] = await pool.execute(
      'SELECT * FROM images WHERE task_id = ? AND status = ?',
      [taskId, 'pending']
    );

    const watermarkConfig: WatermarkConfig = {
      type: config.type,
      text: config.text,
      logoPath: config.logoPath,
      position: (config.position as WatermarkPosition) || 'bottom-right',
      opacity: parseFloat(config.opacity) || 1,
      fontSize: parseInt(config.fontSize) || 24,
      fontColor: config.fontColor || 'rgba(255, 255, 255, 0.8)',
      margin: parseInt(config.margin) || 20,
    };

    let successCount = 0;
    let failedCount = 0;

    const outputDir = path.join(process.cwd(), 'outputs', `task_${taskId}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const image of images as any[]) {
      try {
        await pool.execute('UPDATE images SET status = ? WHERE id = ?', ['processing', image.id]);

        const imageBuffer = fs.readFileSync(image.original_path);
        const imageInfo = await getImageInfo(imageBuffer);
        const resultBuffer = await addWatermark(imageBuffer, watermarkConfig);

        const outputPath = path.join(outputDir, `watermarked_${image.id}_${image.original_filename}`);
        fs.writeFileSync(outputPath, resultBuffer);

        await pool.execute(
          'UPDATE images SET status = ?, watermarked_path = ?, width = ?, height = ? WHERE id = ?',
          ['completed', outputPath, imageInfo.width, imageInfo.height, image.id]
        );

        successCount++;
      } catch (err: any) {
        console.error(`处理图片失败: ${image.original_filename}`, err);
        await pool.execute(
          'UPDATE images SET status = ?, error_message = ? WHERE id = ?',
          ['failed', err.message || '处理失败', image.id]
        );
        failedCount++;
      }
    }

    await pool.execute(
      'UPDATE watermark_tasks SET status = ?, success_count = ?, failed_count = ? WHERE id = ?',
      ['completed', successCount, failedCount, taskId]
    );

    return NextResponse.json({
      success: true,
      taskId,
      successCount,
      failedCount,
      message: `处理完成：成功 ${successCount} 个，失败 ${failedCount} 个`,
    });
  } catch (error: any) {
    console.error('Process error:', error);
    return NextResponse.json({ error: error.message || '处理失败' }, { status: 500 });
  } finally {
    await pool.end();
  }
}
