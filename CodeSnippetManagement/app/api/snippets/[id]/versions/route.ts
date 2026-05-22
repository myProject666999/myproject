import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { SnippetVersion, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snippetId = parseInt(params.id);

    const [rows]: any[] = await pool.query(
      `SELECT * FROM snippet_versions 
       WHERE snippet_id = ? 
       ORDER BY version DESC`,
      [snippetId]
    );

    const versions: SnippetVersion[] = rows.map((row: any) => ({
      ...row
    }));

    return NextResponse.json({
      success: true,
      data: versions
    } as ApiResponse<SnippetVersion[]>);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
