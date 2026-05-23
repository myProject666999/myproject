import { NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { sortColorsByHue, getHue } from '@/lib/colorUtils';
import { ColorScheme, Color } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hue = searchParams.get('hue');
    const range = parseInt(searchParams.get('range') || '30');

    let sql = `
      SELECT DISTINCT cs.*, 
        (SELECT COUNT(*) FROM favorites f WHERE f.scheme_id = cs.id) as favorite_count,
        EXISTS(SELECT 1 FROM favorites f WHERE f.scheme_id = cs.id) as is_favorite
      FROM color_schemes cs
      LEFT JOIN colors c ON c.scheme_id = cs.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (hue) {
      const hueNum = parseInt(hue);
      const minHue = (hueNum - range + 360) % 360;
      const maxHue = (hueNum + range) % 360;
      
      if (minHue > maxHue) {
        sql += ` AND (c.hue >= ? OR c.hue <= ?)`;
        params.push(minHue, maxHue);
      } else {
        sql += ` AND c.hue >= ? AND c.hue <= ?`;
        params.push(minHue, maxHue);
      }
    }

    sql += ` ORDER BY cs.created_at DESC`;

    const schemes: any[] = await query(sql, params);

    const schemesWithColors = await Promise.all(
      schemes.map(async (scheme) => {
        const colors: any[] = await query(
          'SELECT * FROM colors WHERE scheme_id = ? ORDER BY position',
          [scheme.id]
        );
        return {
          id: scheme.id,
          name: scheme.name,
          description: scheme.description,
          createdAt: scheme.created_at,
          updatedAt: scheme.updated_at,
          isFavorite: scheme.is_favorite === 1,
          favoriteCount: scheme.favorite_count,
          colors: colors.map((c) => ({
            id: c.id,
            schemeId: c.scheme_id,
            hex: c.hex,
            hue: c.hue,
            position: c.position,
          })),
        };
      })
    );

    return NextResponse.json({ success: true, data: schemesWithColors });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const connection = await getConnection();
  try {
    const body = await request.json();
    const { name, description, colors } = body;

    if (!name || !colors || colors.length !== 5) {
      return NextResponse.json(
        { success: false, error: '名称和5个颜色是必需的' },
        { status: 400 }
      );
    }

    const sortedColors = sortColorsByHue(colors);

    await connection.beginTransaction();

    const [result]: any = await connection.execute(
      'INSERT INTO color_schemes (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    const schemeId = result.insertId;

    for (let i = 0; i < sortedColors.length; i++) {
      const hex = sortedColors[i];
      const hue = getHue(hex);
      await connection.execute(
        'INSERT INTO colors (scheme_id, hex, hue, position) VALUES (?, ?, ?, ?)',
        [schemeId, hex, hue, i + 1]
      );
    }

    await connection.commit();

    return NextResponse.json({ success: true, data: { id: schemeId } });
  } catch (error: any) {
    await connection.rollback();
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
