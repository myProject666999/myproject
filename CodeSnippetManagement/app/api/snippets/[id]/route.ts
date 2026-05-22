import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { Snippet, SnippetVersion, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snippetId = parseInt(params.id);

    const [rows]: any[] = await pool.query(
      `SELECT s.*, u.username,
        GROUP_CONCAT(t.name) as tag_names,
        GROUP_CONCAT(t.id) as tag_ids
       FROM snippets s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN snippet_tags st ON s.id = st.snippet_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.id = ?
       GROUP BY s.id`,
      [snippetId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '代码片段不存在' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const row = rows[0];
    const snippet: Snippet = {
      ...row,
      tags: row.tag_names ? row.tag_names.split(',').map((name: string, index: number) => ({
        id: parseInt(row.tag_ids.split(',')[index]),
        name
      })) : []
    };

    return NextResponse.json({ success: true, data: snippet } as ApiResponse<Snippet>);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snippetId = parseInt(params.id);
    const body = await request.json();
    const { title, description, code, language, visibility, tags, change_note } = body;

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      const [currentRows]: any = await conn.query(
        'SELECT current_version FROM snippets WHERE id = ?',
        [snippetId]
      );

      if (currentRows.length === 0) {
        await conn.rollback();
        return NextResponse.json(
          { success: false, error: '代码片段不存在' } as ApiResponse<null>,
          { status: 404 }
        );
      }

      const newVersion = currentRows[0].current_version + 1;

      await conn.query(
        `UPDATE snippets 
         SET title = ?, description = ?, code = ?, language = ?, visibility = ?, current_version = ?
         WHERE id = ?`,
        [title, description || null, code, language || 'javascript', visibility || 'public', newVersion, snippetId]
      );

      await conn.query(
        `INSERT INTO snippet_versions (snippet_id, version, title, description, code, language, change_note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [snippetId, newVersion, title, description || null, code, language || 'javascript', change_note || '']
      );

      if (tags) {
        await conn.query('DELETE FROM snippet_tags WHERE snippet_id = ?', [snippetId]);

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

      return NextResponse.json({
        success: true,
        data: { id: snippetId, version: newVersion }
      } as ApiResponse<{ id: number; version: number }>);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snippetId = parseInt(params.id);

    const [result]: any = await pool.query(
      'DELETE FROM snippets WHERE id = ?',
      [snippetId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: '代码片段不存在' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: null
    } as ApiResponse<null>);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
