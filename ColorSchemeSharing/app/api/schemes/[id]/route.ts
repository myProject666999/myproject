import { NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { generateCss, sortColorsByHue, getHue } from '@/lib/colorUtils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schemeId = parseInt(params.id);

    const schemes: any[] = await query(
      `SELECT cs.*, 
        (SELECT COUNT(*) FROM favorites f WHERE f.scheme_id = cs.id) as favorite_count,
        EXISTS(SELECT 1 FROM favorites f WHERE f.scheme_id = cs.id) as is_favorite
      FROM color_schemes cs WHERE cs.id = ?`,
      [schemeId]
    );

    if (schemes.length === 0) {
      return NextResponse.json(
        { success: false, error: '配色方案不存在' },
        { status: 404 }
      );
    }

    const scheme = schemes[0];

    const colors: any[] = await query(
      'SELECT * FROM colors WHERE scheme_id = ? ORDER BY position',
      [schemeId]
    );

    return NextResponse.json({
      success: true,
      data: {
        id: scheme.id,
        name: scheme.name,
        description: scheme.description,
        createdAt: scheme.created_at,
        updatedAt: scheme.updated_at,
        isFavorite: scheme.is_favorite === 1,
        favoriteCount: scheme.favorite_count,
        colors: colors.map((c: any) => ({
          id: c.id,
          schemeId: c.scheme_id,
          hex: c.hex,
          hue: c.hue,
          position: c.position,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schemeId = parseInt(params.id);

    await query('DELETE FROM color_schemes WHERE id = ?', [schemeId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
