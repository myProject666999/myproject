const express = require('express');
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT r.*, c.name as campsite_name, c.type as campsite_type
               FROM reservations r
               LEFT JOIN campsites c ON r.campsite_id = c.id
               WHERE r.user_id = ?`;
    const params = [req.user.id];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [reservations] = await pool.query(sql, params);

    const countParams = [req.user.id];
    let countSql = 'SELECT COUNT(*) as total FROM reservations WHERE user_id = ?';
    
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.query(countSql, countParams);

    for (const reservation of reservations) {
      const [equipments] = await pool.query(
        `SELECT re.*, e.name, e.category
         FROM reservation_equipments re
         LEFT JOIN equipments e ON re.equipment_id = e.id
         WHERE re.reservation_id = ?`,
        [reservation.id]
      );
      reservation.equipments = equipments;

      const [activities] = await pool.query(
        `SELECT ra.*, a.name, a.type
         FROM reservation_activities ra
         LEFT JOIN activities a ON ra.activity_id = a.id
         WHERE ra.reservation_id = ?`,
        [reservation.id]
      );
      reservation.activities = activities;
    }

    res.json({
      success: true,
      data: {
        reservations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      campsite_id,
      checkin_date,
      checkout_date,
      guests,
      equipments = [],
      activities = [],
      contact_name,
      contact_phone,
      remarks
    } = req.body;

    if (!campsite_id || !checkin_date || !checkout_date) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '请填写必要的预订信息'
      });
    }

    const [campsites] = await connection.query(
      'SELECT * FROM campsites WHERE id = ? AND status = "available"',
      [campsite_id]
    );

    if (campsites.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '营位不可用'
      });
    }

    const campsite = campsites[0];

    const [conflicts] = await connection.query(
      `SELECT id FROM reservations 
       WHERE campsite_id = ? 
       AND status NOT IN ('cancelled', 'checked_out')
       AND (
         (checkin_date <= ? AND checkout_date > ?)
         OR (checkin_date < ? AND checkout_date >= ?)
         OR (checkin_date >= ? AND checkout_date <= ?)
       )`,
      [campsite_id, checkout_date, checkin_date, checkout_date, checkin_date, checkin_date, checkout_date]
    );

    if (conflicts.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '该时间段营位已被预订'
      });
    }

    let total_amount = 0;
    const start = new Date(checkin_date);
    const end = new Date(checkout_date);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < nights; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      total_amount += isWeekend ? campsite.weekend_price : campsite.price;
    }

    for (const equip of equipments) {
      const [equipData] = await connection.query(
        'SELECT price FROM equipments WHERE id = ?',
        [equip.id]
      );
      if (equipData.length > 0) {
        total_amount += equipData[0].price * (equip.quantity || 1);
      }
    }

    for (const activity of activities) {
      const [activityData] = await connection.query(
        'SELECT price FROM activities WHERE id = ?',
        [activity.id]
      );
      if (activityData.length > 0) {
        total_amount += activityData[0].price * (activity.participants || 1);
      }
    }

    const order_no = `CS${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const [result] = await connection.query(
      `INSERT INTO reservations 
       (order_no, user_id, campsite_id, checkin_date, checkout_date, nights, guests, 
        total_amount, contact_name, contact_phone, remarks, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_no,
        req.user.id,
        campsite_id,
        checkin_date,
        checkout_date,
        nights,
        guests || 1,
        total_amount,
        contact_name || req.user.nickname,
        contact_phone || req.user.phone,
        remarks || '',
        'paid'
      ]
    );

    const reservationId = result.insertId;

    for (const equip of equipments) {
      await connection.query(
        `INSERT INTO reservation_equipments 
         (reservation_id, equipment_id, quantity, unit_price)
         VALUES (?, ?, ?, (SELECT price FROM equipments WHERE id = ?))`,
        [reservationId, equip.id, equip.quantity || 1, equip.id]
      );
    }

    for (const activity of activities) {
      await connection.query(
        `INSERT INTO reservation_activities 
         (reservation_id, activity_id, participants, unit_price)
         VALUES (?, ?, ?, (SELECT price FROM activities WHERE id = ?))`,
        [reservationId, activity.id, activity.participants || 1, activity.id]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: '预订成功',
      data: {
        reservation_id: reservationId,
        order_no,
        total_amount
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [reservations] = await pool.query(
      `SELECT r.*, c.name as campsite_name, c.type as campsite_type
       FROM reservations r
       LEFT JOIN campsites c ON r.campsite_id = c.id
       WHERE r.id = ? AND r.user_id = ?`,
      [id, req.user.id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    const reservation = reservations[0];

    const [equipments] = await pool.query(
      `SELECT re.*, e.name, e.category
       FROM reservation_equipments re
       LEFT JOIN equipments e ON re.equipment_id = e.id
       WHERE re.reservation_id = ?`,
      [id]
    );
    reservation.equipments = equipments;

    const [activities] = await pool.query(
      `SELECT ra.*, a.name, a.type
       FROM reservation_activities ra
       LEFT JOIN activities a ON ra.activity_id = a.id
       WHERE ra.reservation_id = ?`,
      [id]
    );
    reservation.activities = activities;

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contact_name, contact_phone, remarks } = req.body;

    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    const updates = [];
    const values = [];

    if (contact_name) {
      updates.push('contact_name = ?');
      values.push(contact_name);
    }

    if (contact_phone) {
      updates.push('contact_phone = ?');
      values.push(contact_phone);
    }

    if (remarks !== undefined) {
      updates.push('remarks = ?');
      values.push(remarks);
    }

    if (updates.length > 0) {
      values.push(id, req.user.id);
      await pool.query(
        `UPDATE reservations SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );
    }

    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (['checked_in', 'checked_out', 'cancelled'].includes(reservations[0].status)) {
      return res.status(400).json({
        success: false,
        message: '该订单无法取消'
      });
    }

    await pool.query(
      'UPDATE reservations SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    res.json({
      success: true,
      message: '取消成功'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/checkin', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (reservations[0].status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: '该订单无法签到'
      });
    }

    await pool.query(
      'UPDATE reservations SET status = ?, checkin_time = ? WHERE id = ?',
      ['checked_in', new Date(), id]
    );

    res.json({
      success: true,
      message: '签到成功'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/checkout', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (reservations[0].status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: '该订单无法离店'
      });
    }

    await pool.query(
      'UPDATE reservations SET status = ?, checkout_time = ? WHERE id = ?',
      ['checked_out', new Date(), id]
    );

    res.json({
      success: true,
      message: '离店成功'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
