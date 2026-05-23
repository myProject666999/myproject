import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function generateShareCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareCode = searchParams.get('share');
    const id = searchParams.get('id');

    let invitation;

    if (shareCode) {
      await query('UPDATE invitations SET view_count = view_count + 1 WHERE share_code = ?', [shareCode]);
      const result: any = await query(
        'SELECT i.*, t.name as template_name, t.category as template_category, t.background_color, t.text_color, t.accent_color, t.font_family, t.layout_type, t.animation_style FROM invitations i LEFT JOIN templates t ON i.template_id = t.id WHERE i.share_code = ? AND i.status = 1',
        [shareCode]
      );
      invitation = result[0];
    } else if (id) {
      const result: any = await query(
        'SELECT i.*, t.name as template_name, t.category as template_category, t.background_color, t.text_color, t.accent_color, t.font_family, t.layout_type, t.animation_style FROM invitations i LEFT JOIN templates t ON i.template_id = t.id WHERE i.id = ?',
        [id]
      );
      invitation = result[0];
    } else {
      const result: any = await query(
        'SELECT i.*, t.name as template_name FROM invitations i LEFT JOIN templates t ON i.template_id = t.id ORDER BY i.created_at DESC LIMIT 50'
      );
      return NextResponse.json({ success: true, data: result });
    }

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: '邀请函不存在' },
        { status: 404 }
      );
    }

    const photos: any = await query('SELECT * FROM photos WHERE invitation_id = ? ORDER BY sort_order ASC', [invitation.id]);
    const registrations: any = await query('SELECT * FROM registrations WHERE invitation_id = ? ORDER BY created_at DESC', [invitation.id]);

    return NextResponse.json({
      success: true,
      data: {
        ...invitation,
        photos,
        registration_count: registrations.length,
        registrations,
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
      template_id,
      title,
      subtitle,
      host_name,
      host_name2,
      event_date,
      event_time,
      location_name,
      location_address,
      latitude,
      longitude,
      description,
      cover_image,
      background_music,
    } = body;

    let shareCode = generateShareCode();
    let existing = await query('SELECT id FROM invitations WHERE share_code = ?', [shareCode]);

    while ((existing as any[]).length > 0) {
      shareCode = generateShareCode();
      existing = await query('SELECT id FROM invitations WHERE share_code = ?', [shareCode]);
    }

    const sql = `
      INSERT INTO invitations (template_id, title, subtitle, host_name, host_name2, event_date, event_time, location_name, location_address, latitude, longitude, description, cover_image, background_music, share_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result: any = await query(sql, [
      template_id,
      title,
      subtitle,
      host_name,
      host_name2 || null,
      event_date,
      event_time,
      location_name,
      location_address,
      latitude || null,
      longitude || null,
      description,
      cover_image || null,
      background_music || null,
      shareCode,
    ]);

    return NextResponse.json({
      success: true,
      data: { id: result.insertId, share_code: shareCode },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      template_id,
      title,
      subtitle,
      host_name,
      host_name2,
      event_date,
      event_time,
      location_name,
      location_address,
      latitude,
      longitude,
      description,
      cover_image,
      background_music,
    } = body;

    const sql = `
      UPDATE invitations SET 
        template_id = ?, title = ?, subtitle = ?, host_name = ?, host_name2 = ?,
        event_date = ?, event_time = ?, location_name = ?, location_address = ?,
        latitude = ?, longitude = ?, description = ?, cover_image = ?, background_music = ?
      WHERE id = ?
    `;

    await query(sql, [
      template_id,
      title,
      subtitle,
      host_name,
      host_name2 || null,
      event_date,
      event_time,
      location_name,
      location_address,
      latitude || null,
      longitude || null,
      description,
      cover_image || null,
      background_music || null,
      id,
    ]);

    return NextResponse.json({ success: true, message: '更新成功' });
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

    await query('DELETE FROM invitations WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
