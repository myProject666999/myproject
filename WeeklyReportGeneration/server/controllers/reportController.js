const pool = require('../config/database');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const reportController = {
    getAllReports: async (req, res) => {
        try {
            const { status, user_id } = req.query;
            let sql = 'SELECT r.*, t.name as template_name, u.username as user_name FROM reports r LEFT JOIN templates t ON r.template_id = t.id LEFT JOIN users u ON r.user_id = u.id WHERE 1=1';
            const params = [];
            if (status) {
                sql += ' AND r.status = ?';
                params.push(status);
            }
            if (user_id) {
                sql += ' AND r.user_id = ?';
                params.push(user_id);
            }
            sql += ' ORDER BY r.created_at DESC';
            const [rows] = await pool.execute(sql, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('获取周报列表失败:', error);
            res.status(500).json({ success: false, message: '获取周报列表失败', error: error.message });
        }
    },

    getReportById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute(
                'SELECT r.*, t.name as template_name, t.content as template_content, t.variables as template_variables, u.username as user_name FROM reports r LEFT JOIN templates t ON r.template_id = t.id LEFT JOIN users u ON r.user_id = u.id WHERE r.id = ?',
                [id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: '周报不存在' });
            }
            const report = rows[0];
            if (report.template_variables) {
                if (typeof report.template_variables === 'string') {
                    try {
                        report.template_variables = JSON.parse(report.template_variables);
                    } catch (e) {
                        console.warn('解析 template_variables 失败:', e);
                    }
                }
            }
            const [dataSources] = await pool.execute(
                'SELECT ds.* FROM data_sources ds INNER JOIN report_data_sources rds ON ds.id = rds.data_source_id WHERE rds.report_id = ?',
                [id]
            );
            report.data_sources = dataSources;
            res.json({ success: true, data: report });
        } catch (error) {
            console.error('获取周报详情失败:', error);
            res.status(500).json({ success: false, message: '获取周报详情失败', error: error.message });
        }
    },

    getReportsByWeek: async (req, res) => {
        try {
            const { weekStart, weekEnd } = req.params;
            const [rows] = await pool.execute(
                'SELECT r.*, t.name as template_name, u.username as user_name FROM reports r LEFT JOIN templates t ON r.template_id = t.id LEFT JOIN users u ON r.user_id = u.id WHERE r.week_start = ? AND r.week_end = ? ORDER BY r.created_at DESC',
                [weekStart, weekEnd]
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('获取指定周周报失败:', error);
            res.status(500).json({ success: false, message: '获取指定周周报失败', error: error.message });
        }
    },

    createReport: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const { title, content, week_start, week_end, template_id, user_id, data_source_ids } = req.body;
            const [result] = await connection.execute(
                'INSERT INTO reports (title, content, week_start, week_end, template_id, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [title, content || '', week_start, week_end, template_id || null, user_id || 1, 'draft']
            );
            const reportId = result.insertId;
            if (data_source_ids && data_source_ids.length > 0) {
                for (const sourceId of data_source_ids) {
                    await connection.execute(
                        'INSERT INTO report_data_sources (report_id, data_source_id) VALUES (?, ?)',
                        [reportId, sourceId]
                    );
                    await connection.execute(
                        'UPDATE data_sources SET report_id = ? WHERE id = ?',
                        [reportId, sourceId]
                    );
                }
            }
            await connection.commit();
            res.json({ success: true, message: '周报创建成功', data: { id: reportId } });
        } catch (error) {
            await connection.rollback();
            console.error('创建周报失败:', error);
            res.status(500).json({ success: false, message: '创建周报失败', error: error.message });
        } finally {
            connection.release();
        }
    },

    updateReport: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const { id } = req.params;
            const { title, content, week_start, week_end, template_id, data_source_ids } = req.body;
            await connection.execute(
                'UPDATE reports SET title = ?, content = ?, week_start = ?, week_end = ?, template_id = ? WHERE id = ?',
                [title, content, week_start, week_end, template_id || null, id]
            );
            if (data_source_ids) {
                await connection.execute('DELETE FROM report_data_sources WHERE report_id = ?', [id]);
                await connection.execute('UPDATE data_sources SET report_id = NULL WHERE report_id = ?', [id]);
                for (const sourceId of data_source_ids) {
                    await connection.execute(
                        'INSERT INTO report_data_sources (report_id, data_source_id) VALUES (?, ?)',
                        [id, sourceId]
                    );
                    await connection.execute(
                        'UPDATE data_sources SET report_id = ? WHERE id = ?',
                        [id, sourceId]
                    );
                }
            }
            await connection.commit();
            res.json({ success: true, message: '周报更新成功' });
        } catch (error) {
            await connection.rollback();
            console.error('更新周报失败:', error);
            res.status(500).json({ success: false, message: '更新周报失败', error: error.message });
        } finally {
            connection.release();
        }
    },

    deleteReport: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute('DELETE FROM reports WHERE id = ?', [id]);
            res.json({ success: true, message: '周报删除成功' });
        } catch (error) {
            console.error('删除周报失败:', error);
            res.status(500).json({ success: false, message: '删除周报失败', error: error.message });
        }
    },

    publishReport: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute('UPDATE reports SET status = ? WHERE id = ?', ['published', id]);
            res.json({ success: true, message: '周报发布成功' });
        } catch (error) {
            console.error('发布周报失败:', error);
            res.status(500).json({ success: false, message: '发布周报失败', error: error.message });
        }
    },

    archiveReport: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute('UPDATE reports SET status = ? WHERE id = ?', ['archived', id]);
            res.json({ success: true, message: '周报归档成功' });
        } catch (error) {
            console.error('归档周报失败:', error);
            res.status(500).json({ success: false, message: '归档周报失败', error: error.message });
        }
    },

    exportReport: async (req, res) => {
        try {
            const { id } = req.params;
            const { format = 'markdown' } = req.body;
            const [rows] = await pool.execute('SELECT * FROM reports WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: '周报不存在' });
            }
            const report = rows[0];
            if (format === 'markdown') {
                const exportDir = path.join(__dirname, '..', 'exports');
                if (!fs.existsSync(exportDir)) {
                    fs.mkdirSync(exportDir, { recursive: true });
                }
                const filename = `weekly_report_${report.week_start}_${report.week_end}_${Date.now()}.md`;
                const filepath = path.join(exportDir, filename);
                fs.writeFileSync(filepath, report.content, 'utf-8');
                res.download(filepath, filename);
            } else {
                res.json({ success: true, data: { content: report.content } });
            }
        } catch (error) {
            console.error('导出周报失败:', error);
            res.status(500).json({ success: false, message: '导出周报失败', error: error.message });
        }
    },

    aiPolishReport: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute('SELECT * FROM reports WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: '周报不存在' });
            }
            const report = rows[0];
            const polishedContent = report.content
                .replace(/\n{3,}/g, '\n\n')
                .replace(/^#\s+/gm, '# ')
                .replace(/^##\s+/gm, '## ')
                .replace(/^###\s+/gm, '### ')
                .trim();
            await pool.execute(
                'UPDATE reports SET content = ?, ai_polished = 1 WHERE id = ?',
                [polishedContent, id]
            );
            res.json({ success: true, message: 'AI润色完成', data: { content: polishedContent } });
        } catch (error) {
            console.error('AI润色失败:', error);
            res.status(500).json({ success: false, message: 'AI润色失败', error: error.message });
        }
    }
};

module.exports = reportController;
