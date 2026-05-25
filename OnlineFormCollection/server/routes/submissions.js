const express = require('express');
const { getPool } = require('../db/init');

const router = express.Router();

function validateSubmission(form, fields, data) {
  const errors = [];
  for (const field of fields) {
    const value = data[`field_${field.id}`];
    const required = field.required === 1;
    if (required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
      errors.push({ field: field.id, label: field.label, message: `${field.label} 不能为空` });
      continue;
    }
    if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      const validation = JSON.parse(field.validation || '{}');
      if (field.field_type === 'text' || field.field_type === 'textarea') {
        const strVal = String(value);
        if (validation.minLength && strVal.length < validation.minLength) {
          errors.push({ field: field.id, label: field.label, message: `${field.label} 最少需要 ${validation.minLength} 个字符` });
        }
        if (validation.maxLength && strVal.length > validation.maxLength) {
          errors.push({ field: field.id, label: field.label, message: `${field.label} 最多允许 ${validation.maxLength} 个字符` });
        }
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(strVal)) {
            errors.push({ field: field.id, label: field.label, message: validation.patternMessage || `${field.label} 格式不正确` });
          }
        }
      }
      if (field.field_type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({ field: field.id, label: field.label, message: `${field.label} 必须是数字` });
        } else {
          if (validation.min !== undefined && num < validation.min) {
            errors.push({ field: field.id, label: field.label, message: `${field.label} 不能小于 ${validation.min}` });
          }
          if (validation.max !== undefined && num > validation.max) {
            errors.push({ field: field.id, label: field.label, message: `${field.label} 不能大于 ${validation.max}` });
          }
        }
      }
      if (field.field_type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors.push({ field: field.id, label: field.label, message: `${field.label} 邮箱格式不正确` });
        }
      }
      if (field.field_type === 'date') {
        if (validation.minDate && String(value) < validation.minDate) {
          errors.push({ field: field.id, label: field.label, message: `${field.label} 不能早于 ${validation.minDate}` });
        }
        if (validation.maxDate && String(value) > validation.maxDate) {
          errors.push({ field: field.id, label: field.label, message: `${field.label} 不能晚于 ${validation.maxDate}` });
        }
      }
    }
  }
  return errors;
}

router.get('/form/:formId', async (req, res) => {
  const pool = getPool();
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.formId]);
  if (forms.length === 0) {
    return res.status(404).json({ error: '表单不存在' });
  }
  const { page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;
  const [totalRow] = await pool.query('SELECT COUNT(*) as count FROM submissions WHERE form_id = ?', [req.params.formId]);
  const total = totalRow[0].count;
  const [submissions] = await pool.query(
    'SELECT * FROM submissions WHERE form_id = ? ORDER BY submitted_at DESC LIMIT ? OFFSET ?',
    [req.params.formId, parseInt(pageSize), offset]
  );
  const parsed = submissions.map(s => ({
    ...s,
    data: JSON.parse(s.data)
  }));
  res.json({
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    list: parsed
  });
});

router.post('/form/:formId', async (req, res) => {
  const pool = getPool();
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.formId]);
  if (forms.length === 0) {
    return res.status(404).json({ error: '表单不存在' });
  }
  const form = forms[0];
  if (form.status !== 'published') {
    return res.status(400).json({ error: '表单尚未发布，无法提交' });
  }
  if (form.max_submissions > 0) {
    const [countRow] = await pool.query('SELECT COUNT(*) as count FROM submissions WHERE form_id = ?', [req.params.formId]);
    if (countRow[0].count >= form.max_submissions) {
      return res.status(400).json({ error: '提交次数已达上限' });
    }
  }
  const [fields] = await pool.query('SELECT * FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC', [req.params.formId]);
  const errors = validateSubmission(form, fields, req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: '数据校验失败', errors });
  }
  const [result] = await pool.query(
    'INSERT INTO submissions (form_id, data) VALUES (?, ?)',
    [req.params.formId, JSON.stringify(req.body)]
  );
  const [subs] = await pool.query('SELECT * FROM submissions WHERE id = ?', [result.insertId]);
  const submission = subs[0];
  submission.data = JSON.parse(submission.data);
  res.status(201).json(submission);
});

router.delete('/:id', async (req, res) => {
  const pool = getPool();
  const [subs] = await pool.query('SELECT * FROM submissions WHERE id = ?', [req.params.id]);
  if (subs.length === 0) {
    return res.status(404).json({ error: '提交记录不存在' });
  }
  await pool.query('DELETE FROM submissions WHERE id = ?', [req.params.id]);
  res.json({ message: '删除成功' });
});

module.exports = router;
