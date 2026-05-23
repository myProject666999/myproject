import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const pool = getPool();
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const taskName = formData.get('taskName') as string || '批量处理任务';
    const templateIdStr = formData.get('templateId') as string;
    const templateId = templateIdStr ? parseInt(templateIdStr) : null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [taskResult]: any[] = await pool.execute(
      'INSERT INTO watermark_tasks (task_name, template_id, status, total_count) VALUES (?, ?, ?, ?)',
      [taskName, templateId, 'pending', files.length]
    );

    const taskId = (taskResult as any).insertId;

    for (const file of files) {
      const originalFilename = file.name;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileSize = fileBuffer.length;
      
      const ext = path.extname(originalFilename);
      const baseName = path.basename(originalFilename, ext);
      const uniqueName = `${baseName}_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);
      
      fs.writeFileSync(filePath, fileBuffer);

      await pool.execute(
        'INSERT INTO images (task_id, original_filename, original_path, status, file_size) VALUES (?, ?, ?, ?, ?)',
        [taskId, originalFilename, filePath, 'pending', fileSize]
      );
    }

    return NextResponse.json({
      success: true,
      taskId,
      message: `成功上传 ${files.length} 个文件`,
      count: files.length,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || '上传失败' }, { status: 500 });
  } finally {
    await pool.end();
  }
}
