import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = 'SELECT DISTINCT name FROM tags';
    const params: any[] = [];

    if (search) {
      query += ' WHERE name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name LIMIT 50';

    const [rows]: any[] = await pool.query(query, params);

    const tags: string[] = rows.map((row: any) => row.name);

    return NextResponse.json({
      success: true,
      data: tags
    } as ApiResponse<string[]>);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
