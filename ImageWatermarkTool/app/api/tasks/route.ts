import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      const [images]: any[] = await pool.execute(
        'SELECT * FROM images WHERE task_id = ? ORDER BY created_at DESC',
        [taskId]
      );
      return NextResponse.json({ success: true, images: images as any[] });
    }

    const [tasks]: any[] = await pool.execute(
      `SELECT t.*, COUNT(i.id) as image_count
       FROM watermark_tasks t
       LEFT JOIN images i ON t.id = i.task_id
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    );

    return NextResponse.json({ success: true, tasks: tasks as any[] });
  } catch (error: any) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function DELETE(req: NextRequest) {
  const pool = getPool();
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 });
    }

    await pool.execute('DELETE FROM watermark_tasks WHERE id = ?', [taskId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/tasks error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
