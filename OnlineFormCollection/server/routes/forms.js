const express = require('express');
const { getPool } = require('../db/init');

const router = express.Router();

router.get('/', async (req, res) => {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT f.*, COUNT(s.id) as submission_count
    FROM forms f
    LEFT JOIN submissions s ON f.id = s.form_id
    GROUP BY f.id
    ORDER BY f.created_at DESC
  `);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const pool = getPool();
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.id]);
  if (forms.length === 0) {
    return res.status(404).json({ error: '表单不存在' });
  }
  const form = forms[0];
  const [fields] = await pool.query('SELECT * FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC', [req.params.id]);
  form.fields = fields.map(f => ({
    ...f,
    options: JSON.parse(f.options || '[]'),
    validation: JSON.parse(f.validation || '{}'),
    required: f.required === 1
  }));
  res.json(form);
});

router.post('/', async (req, res) => {
  const pool = getPool();
  const { title, description = '', status = 'draft', max_submissions = 0 } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: '表单标题不能为空' });
  }
  const [result] = await pool.query(
    'INSERT INTO forms (title, description, status, max_submissions) VALUES (?, ?, ?, ?)',
    [title.trim(), description, status, max_submissions]
  );
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [result.insertId]);
  res.status(201).json(forms[0]);
});

router.put('/:id', async (req, res) => {
  const pool = getPool();
  const { title, description, status, max_submissions } = req.body;
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.id]);
  if (forms.length === 0) {
    return res.status(404).json({ error: '表单不存在' });
  }
  const f = forms[0];
  await pool.query(
    `UPDATE forms SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      max_submissions = COALESCE(?, max_submissions),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [title, description, status, max_submissions, req.params.id]
  );
  const [updated] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.id]);
  res.json(updated[0]);
});

router.delete('/:id', async (req, res) => {
  const pool = getPool();
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.id]);
  if (forms.length === 0) {
    return res.status(404).json({ error: '表单不存在' });
  }
  await pool.query('DELETE FROM form_fields WHERE form_id = ?', [req.params.id]);
  await pool.query('DELETE FROM submissions WHERE form_id = ?', [req.params.id]);
  await pool.query('DELETE FROM forms WHERE id = ?', [req.params.id]);
  res.json({ message: '删除成功' });
});

router.post('/:id/fields', async (req, res) => {
  const pool = getPool();
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.id]);
  if (forms.length === 0) {
    return res.status(404).json({ error: '表单不存在' });
  }
  const { field_type, label, placeholder = '', required = false, options = [], validation = {}, sort_order = 0 } = req.body;
  if (!field_type || !label) {
    return res.status(400).json({ error: '字段类型和标签不能为空' });
  }
  const [result] = await pool.query(
    `INSERT INTO form_fields (form_id, field_type, label, placeholder, required, options, validation, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.params.id,
      field_type,
      label,
      placeholder,
      required ? 1 : 0,
      JSON.stringify(options),
      JSON.stringify(validation),
      sort_order
    ]
  );
  const [fields] = await pool.query('SELECT * FROM form_fields WHERE id = ?', [result.insertId]);
  const field = fields[0];
  field.options = JSON.parse(field.options || '[]');
  field.validation = JSON.parse(field.validation || '{}');
  field.required = field.required === 1;
  res.status(201).json(field);
});

router.put('/fields/:fieldId', async (req, res) => {
  const pool = getPool();
  const [fields] = await pool.query('SELECT * FROM form_fields WHERE id = ?', [req.params.fieldId]);
  if (fields.length === 0) {
    return res.status(404).json({ error: '字段不存在' });
  }
  const { label, placeholder, required, options, validation, sort_order } = req.body;
  await pool.query(
    `UPDATE form_fields SET
      label = COALESCE(?, label),
      placeholder = COALESCE(?, placeholder),
      required = COALESCE(?, required),
      options = COALESCE(?, options),
      validation = COALESCE(?, validation),
      sort_order = COALESCE(?, sort_order)
    WHERE id = ?`,
    [
      label,
      placeholder,
      required !== undefined ? (required ? 1 : 0) : null,
      options ? JSON.stringify(options) : null,
      validation ? JSON.stringify(validation) : null,
      sort_order,
      req.params.fieldId
    ]
  );
  const [updated] = await pool.query('SELECT * FROM form_fields WHERE id = ?', [req.params.fieldId]);
  const field = updated[0];
  field.options = JSON.parse(field.options || '[]');
  field.validation = JSON.parse(field.validation || '{}');
  field.required = field.required === 1;
  res.json(field);
});

router.delete('/fields/:fieldId', async (req, res) => {
  const pool = getPool();
  const [fields] = await pool.query('SELECT * FROM form_fields WHERE id = ?', [req.params.fieldId]);
  if (fields.length === 0) {
    return res.status(404).json({ error: '字段不存在' });
  }
  await pool.query('DELETE FROM form_fields WHERE id = ?', [req.params.fieldId]);
  res.json({ message: '字段删除成功' });
});

router.put('/:id/fields/reorder', async (req, res) => {
  const pool = getPool();
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: '排序数据格式错误' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const item of orders) {
      await conn.query('UPDATE form_fields SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
    }
    await conn.commit();
    res.json({ message: '排序更新成功' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: '排序更新失败' });
  } finally {
    conn.release();
  }
});

module.exports = router;
