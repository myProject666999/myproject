import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { Snippet, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const language = searchParams.get('language') || '';
    const tag = searchParams.get('tag') || '';
    const visibility = searchParams.get('visibility') || 'public';

    const offset = (page - 1) * pageSize;

    let query = `
      SELECT DISTINCT s.*, u.username, 
        GROUP_CONCAT(t.name) as tag_names
      FROM snippets s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN snippet_tags st ON s.id = st.snippet_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (s.title LIKE ? OR s.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (language) {
      query += ' AND s.language = ?';
      params.push(language);
    }

    if (visibility === 'public') {
      query += ' AND s.visibility = ?';
      params.push('public');
    }

    query += ' GROUP BY s.id ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const [rows]: any[] = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM snippets s
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND (s.title LIKE ? OR s.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (language) {
      countQuery += ' AND s.language = ?';
      countParams.push(language);
    }

    if (visibility === 'public') {
      countQuery += ' AND s.visibility = ?';
      countParams.push('public');
    }

    const [countResult]: any[] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    const snippets: Snippet[] = rows.map((row: any) => ({
      ...row,
      tags: row.tag_names ? row.tag_names.split(',').map((name: string, index: number) => ({
        id: index,
        name
      })) : []
    }));

    const response: ApiResponse<Snippet[]> = {
      success: true,
      data: snippets,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, code, language, visibility, tags } = body;

    if (!title || !code) {
      return NextResponse.json(
        { success: false, error: '标题和代码不能为空' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      const [result]: any = await conn.query(
        `INSERT INTO snippets (title, description, code, language, visibility, current_version)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [title, description || null, code, language || 'javascript', visibility || 'public']
      );

      const snippetId = result.insertId;

      await conn.query(
        `INSERT INTO snippet_versions (snippet_id, version, title, description, code, language, change_note)
         VALUES (?, 1, ?, ?, ?, ?, '初始版本')`,
        [snippetId, title, description || null, code, language || 'javascript']
      );

      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const [tagRows]: any = await conn.query(
            'SELECT id FROM tags WHERE name = ?',
            [tagName]
          );

          let tagId;
          if (tagRows.length > 0) {
            tagId = tagRows[0].id;
          } else {
            const [tagResult]: any = await conn.query(
              'INSERT INTO tags (name) VALUES (?)',
              [tagName]
            );
            tagId = tagResult.insertId;
          }

          await conn.query(
            'INSERT IGNORE INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
            [snippetId, tagId]
          );
        }
      }

      await conn.commit();

      return NextResponse.json(
        { success: true, data: { id: snippetId } } as ApiResponse<{ id: number }>,
        { status: 201 }
      );
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
