import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitation_id');

    if (!invitationId) {
      return NextResponse.json(
        { success: false, message: '缺少邀请函ID' },
        { status: 400 }
      );
    }

    const registrations: any = await query(
      'SELECT * FROM registrations WHERE invitation_id = ? ORDER BY created_at DESC',
      [invitationId]
    );

    const attendCount = registrations.filter((r: any) => r.attend_status === 1).reduce((sum: number, r: any) => sum + (r.attend_count || 1), 0);

    return NextResponse.json({
      success: true,
      data: {
        list: registrations,
        total: registrations.length,
        attend_count: attendCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      invitation_id,
      name,
      phone,
      attend_count,
      message,
      attend_status,
    } = body;

    if (!invitation_id || !name || !phone) {
      return NextResponse.json(
        { success: false, message: '请填写必填项' },
        { status: 400 }
      );
    }

    const invitation: any = await query(
      'SELECT id FROM invitations WHERE id = ? AND status = 1',
      [invitation_id]
    );

    if (!invitation || invitation.length === 0) {
      return NextResponse.json(
        { success: false, message: '邀请函不存在或已失效' },
        { status: 404 }
      );
    }

    const existingRegistration: any = await query(
      'SELECT id FROM registrations WHERE invitation_id = ? AND phone = ?',
      [invitation_id, phone]
    );

    if (existingRegistration.length > 0) {
      return NextResponse.json(
        { success: false, message: '该手机号已报名' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO registrations (invitation_id, name, phone, attend_count, message, attend_status, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result: any = await query(sql, [
      invitation_id,
      name,
      phone,
      attend_count || 1,
      message || null,
      attend_status !== undefined ? attend_status : 1,
      request.headers.get('x-forwarded-for') || '127.0.0.1',
    ]);

    return NextResponse.json({
      success: true,
      data: { id: result.insertId },
      message: attend_status === 0 ? '已记录您的回复' : '报名成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少ID参数' },
        { status: 400 }
      );
    }

    await query('DELETE FROM registrations WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
