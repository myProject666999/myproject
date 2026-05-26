const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/overview', async (req, res) => {
  try {
    const [assetStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(CASE WHEN status = 'IDLE' THEN 1 ELSE 0 END) as idle_count,
        SUM(CASE WHEN status = 'IN_USE' THEN 1 ELSE 0 END) as in_use_count,
        SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenance_count,
        SUM(CASE WHEN status = 'SCRAPPED' THEN 1 ELSE 0 END) as scrapped_count,
        SUM(CASE WHEN status = 'LOST' THEN 1 ELSE 0 END) as lost_count,
        SUM(purchase_price) as total_value
      FROM assets
    `);
    
    const [borrowStats] = await pool.query(`
      SELECT COUNT(*) as borrowing_count
      FROM borrow_records
      WHERE status = 'BORROWED'
    `);
    
    const [maintenanceStats] = await pool.query(`
      SELECT COUNT(*) as pending_maintenance
      FROM maintenance_records
      WHERE status IN ('PENDING', 'PROCESSING')
    `);
    
    const [scrapStats] = await pool.query(`
      SELECT COUNT(*) as pending_scrap
      FROM scrap_records
      WHERE status = 'PENDING'
    `);
    
    res.json({
      code: 200,
      data: {
        ...assetStats[0],
        borrowing_count: borrowStats[0].borrowing_count,
        pending_maintenance: maintenanceStats[0].pending_maintenance,
        pending_scrap: scrapStats[0].pending_scrap
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/by-category', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, COUNT(a.id) as count
      FROM asset_categories c
      LEFT JOIN assets a ON c.id = a.category_id
      WHERE c.parent_id = 0
      GROUP BY c.id, c.name
    `);
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/by-department', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.id, d.name, COUNT(a.id) as count
      FROM departments d
      LEFT JOIN assets a ON d.id = a.current_department_id
      GROUP BY d.id, d.name
    `);
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
