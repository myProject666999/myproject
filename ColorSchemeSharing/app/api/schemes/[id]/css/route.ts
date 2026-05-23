import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateCss } from '@/lib/colorUtils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schemeId = parseInt(params.id);

    const schemes: any[] = await query(
      'SELECT * FROM color_schemes WHERE id = ?',
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
      'SELECT hex FROM colors WHERE scheme_id = ? ORDER BY position',
      [schemeId]
    );

    const colorHexes = colors.map((c: any) => c.hex);
    const css = generateCss(colorHexes, scheme.name);

    const safeName = `color-scheme-${schemeId}`;

    return new Response(css, {
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeName}.css"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
