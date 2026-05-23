import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { fetchFavicon } from '@/lib/favicon';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category');
  const search = searchParams.get('search');
  const isPrivate = searchParams.get('private');
  const isFeatured = searchParams.get('featured');
  const limit = searchParams.get('limit');

  const db = getDb();
  let query = `
    SELECT w.*, c.name as category_name, c.icon as category_icon
    FROM websites w
    LEFT JOIN categories c ON w.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (categoryId) {
    query += ' AND w.category_id = ?';
    params.push(parseInt(categoryId));
  }

  if (search) {
    query += ' AND (w.name LIKE ? OR w.url LIKE ? OR w.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (isPrivate !== null) {
    query += ' AND w.is_private = ?';
    params.push(isPrivate === 'true' ? 1 : 0);
  }

  if (isFeatured !== null) {
    query += ' AND w.is_featured = ?';
    params.push(isFeatured === 'true' ? 1 : 0);
  }

  query += ' ORDER BY w.sort_order ASC, w.id ASC';

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
  }

  const websites = db.prepare(query).all(...params);
  return NextResponse.json(websites);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      url,
      description = '',
      category_id,
      is_private = 0,
      is_featured = 0,
      sort_order = 0,
    } = body;

    if (!name?.trim() || !url?.trim() || !category_id) {
      return NextResponse.json(
        { error: '名称、URL和分类不能为空' },
        { status: 400 }
      );
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const faviconUrl = await fetchFavicon(normalizedUrl);

    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO websites (name, url, description, category_id, is_private, is_featured, favicon_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name.trim(),
        normalizedUrl,
        description,
        parseInt(category_id),
        is_private ? 1 : 0,
        is_featured ? 1 : 0,
        faviconUrl,
        sort_order
      );

    const website = db
      .prepare(
        `SELECT w.*, c.name as category_name, c.icon as category_icon
         FROM websites w
         LEFT JOIN categories c ON w.category_id = c.id
         WHERE w.id = ?`
      )
      .get(result.lastInsertRowid);

    return NextResponse.json(website);
  } catch (error) {
    return NextResponse.json({ error: '创建网站失败' }, { status: 500 });
  }
}
