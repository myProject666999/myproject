import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const [rows]: any[] = await pool.query(
      'SELECT DISTINCT language FROM snippets ORDER BY language'
    );

    const languages: string[] = rows.map((row: any) => row.language);

    return NextResponse.json({
      success: true,
      data: languages
    } as ApiResponse<string[]>);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
