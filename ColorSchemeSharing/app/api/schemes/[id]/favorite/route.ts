import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schemeId = parseInt(params.id);

    const existing: any[] = await query(
      'SELECT * FROM favorites WHERE scheme_id = ?',
      [schemeId]
    );

    if (existing.length > 0) {
      await query('DELETE FROM favorites WHERE scheme_id = ?', [schemeId]);
      return NextResponse.json({ success: true, data: { isFavorite: false } });
    } else {
      await query('INSERT INTO favorites (scheme_id) VALUES (?)', [schemeId]);
      return NextResponse.json({ success: true, data: { isFavorite: true } });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
