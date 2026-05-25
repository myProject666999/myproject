const express = require('express');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const { getPool } = require('../db/init');

const router = express.Router();

router.get('/csv/:formId', async (req, res) => {
  const pool = getPool();
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.formId]);
  if (forms.length === 0) {
    return res.status(404).json({ error: '表单不存在' });
  }
  const form = forms[0];
  const [fields] = await pool.query('SELECT * FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC', [req.params.formId]);
  const [submissions] = await pool.query('SELECT * FROM submissions WHERE form_id = ? ORDER BY submitted_at DESC', [req.params.formId]);

  const rows = submissions.map(s => {
    const data = JSON.parse(s.data);
    const row = {
      提交时间: s.submitted_at
    };
    for (const field of fields) {
      const val = data[`field_${field.id}`];
      row[field.label] = Array.isArray(val) ? val.join(', ') : (val || '');
    }
    return row;
  });

  const fieldsList = ['提交时间', ...fields.map(f => f.label)];
  const json2csvParser = new Parser({ fields: fieldsList });
  const csv = json2csvParser.parse(rows);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(form.title)}.csv"`);
  res.send('\uFEFF' + csv);
});

router.get('/excel/:formId', async (req, res) => {
  const pool = getPool();
  const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [req.params.formId]);
  if (forms.length === 0) {
    return res.status(404).json({ error: '表单不存在' });
  }
  const form = forms[0];
  const [fields] = await pool.query('SELECT * FROM form_fields WHERE form_id = ? ORDER BY sort_order ASC', [req.params.formId]);
  const [submissions] = await pool.query('SELECT * FROM submissions WHERE form_id = ? ORDER BY submitted_at DESC', [req.params.formId]);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('数据');

  const columns = [
    { header: '提交时间', key: 'time', width: 20 }
  ];
  for (const field of fields) {
    columns.push({ header: field.label, key: `field_${field.id}`, width: 20 });
  }
  worksheet.columns = columns;

  for (const s of submissions) {
    const data = JSON.parse(s.data);
    const row = { time: s.submitted_at };
    for (const field of fields) {
      const val = data[`field_${field.id}`];
      row[`field_${field.id}`] = Array.isArray(val) ? val.join(', ') : (val || '');
    }
    worksheet.addRow(row);
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(form.title)}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
