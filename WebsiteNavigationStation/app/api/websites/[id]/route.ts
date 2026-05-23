import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { fetchFavicon } from '@/lib/favicon';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, url, description, category_id, is_private, is_featured, sort_order } = body;
    const id = parseInt(params.id);

    if (!id) {
      return NextResponse.json({ error: '无效的网站ID' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM websites WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json({ error: '网站不存在' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: '网站名称不能为空' }, { status: 400 });
      }
      updates.push('name = ?');
      values.push(name.trim());
    }

    if (url !== undefined) {
      if (!url.trim()) {
        return NextResponse.json({ error: 'URL不能为空' }, { status: 400 });
      }
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      updates.push('url = ?');
      values.push(normalizedUrl);

      const faviconUrl = await fetchFavicon(normalizedUrl);
      if (faviconUrl) {
        updates.push('favicon_url = ?');
        values.push(faviconUrl);
      }
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(parseInt(category_id));
    }

    if (is_private !== undefined) {
      updates.push('is_private = ?');
      values.push(is_private ? 1 : 0);
    }

    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      values.push(is_featured ? 1 : 0);
    }

    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(sort_order);
    }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE websites SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const website = db
      .prepare(
        `SELECT w.*, c.name as category_name, c.icon as category_icon
         FROM websites w
         LEFT JOIN categories c ON w.category_id = c.id
         WHERE w.id = ?`
      )
      .get(id);

    return NextResponse.json(website);
  } catch (error) {
    return NextResponse.json({ error: '更新网站失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (!id) {
      return NextResponse.json({ error: '无效的网站ID' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM websites WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json({ error: '网站不存在' }, { status: 404 });
    }

    db.prepare('DELETE FROM websites WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '删除网站失败' }, { status: 500 });
  }
}
