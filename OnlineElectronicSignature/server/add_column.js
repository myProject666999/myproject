const pool = require('./config/db');

async function addColumn() {
    try {
        const [rows] = await pool.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='electronic_signature' AND TABLE_NAME='contracts' AND COLUMN_NAME='file_name'");
        if (rows.length === 0) {
            await pool.query('ALTER TABLE contracts ADD COLUMN file_name VARCHAR(255) AFTER file_url');
            console.log('file_name 列添加成功');
        } else {
            console.log('file_name 列已存在');
        }
        process.exit(0);
    } catch (err) {
        console.error('添加列失败:', err.message);
        process.exit(1);
    }
}

addColumn();
