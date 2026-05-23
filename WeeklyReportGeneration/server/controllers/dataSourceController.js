const pool = require('../config/database');

const dataSourceController = {
    getAllDataSources: async (req, res) => {
        try {
            const { source_type, week_start, week_end, user_id } = req.query;
            let sql = 'SELECT * FROM data_sources WHERE 1=1';
            const params = [];
            if (source_type) {
                sql += ' AND source_type = ?';
                params.push(source_type);
            }
            if (week_start && week_end) {
                sql += ' AND week_start = ? AND week_end = ?';
                params.push(week_start, week_end);
            }
            if (user_id) {
                sql += ' AND user_id = ?';
                params.push(user_id);
            }
            sql += ' ORDER BY created_at DESC';
            const [rows] = await pool.execute(sql, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('获取数据源列表失败:', error);
            res.status(500).json({ success: false, message: '获取数据源列表失败', error: error.message });
        }
    },

    getDataSourceById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute('SELECT * FROM data_sources WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: '数据源不存在' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('获取数据源详情失败:', error);
            res.status(500).json({ success: false, message: '获取数据源详情失败', error: error.message });
        }
    },

    getDataSourcesByWeek: async (req, res) => {
        try {
            const { weekStart, weekEnd } = req.params;
            const [rows] = await pool.execute(
                'SELECT * FROM data_sources WHERE week_start = ? AND week_end = ? ORDER BY source_type, created_at DESC',
                [weekStart, weekEnd]
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('获取周数据源失败:', error);
            res.status(500).json({ success: false, message: '获取周数据源失败', error: error.message });
        }
    },

    getDataSourcesByType: async (req, res) => {
        try {
            const { sourceType } = req.params;
            const [rows] = await pool.execute(
                'SELECT * FROM data_sources WHERE source_type = ? ORDER BY created_at DESC',
                [sourceType]
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('获取类型数据源失败:', error);
            res.status(500).json({ success: false, message: '获取类型数据源失败', error: error.message });
        }
    },

    createDataSource: async (req, res) => {
        try {
            const {
                source_type, title, description, status,
                commit_hash, commit_message, commit_author, commit_date,
                repository, branch, priority, due_date,
                user_id, week_start, week_end
            } = req.body;
            
            console.log('创建数据源请求:', req.body);
            
            if (!source_type || !title || !week_start || !week_end) {
                return res.status(400).json({ 
                    success: false, 
                    message: '缺少必填字段: source_type, title, week_start, week_end' 
                });
            }
            
            const [result] = await pool.execute(
                `INSERT INTO data_sources 
                (source_type, title, description, status, commit_hash, commit_message, 
                commit_author, commit_date, repository, branch, priority, due_date, 
                user_id, week_start, week_end) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [source_type, title, description || '', status || 'pending',
                 commit_hash || null, commit_message || null, commit_author || null, commit_date || null,
                 repository || null, branch || null, priority || 'medium', due_date || null,
                 user_id || 1, week_start, week_end]
            );
            res.json({ success: true, message: '数据源创建成功', data: { id: result.insertId } });
        } catch (error) {
            console.error('创建数据源失败:', error);
            res.status(500).json({ success: false, message: '创建数据源失败', error: error.message, stack: error.stack });
        }
    },

    updateDataSource: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title, description, status,
                commit_hash, commit_message, commit_author, commit_date,
                repository, branch, priority, due_date
            } = req.body;
            await pool.execute(
                `UPDATE data_sources SET 
                title = ?, description = ?, status = ?, commit_hash = ?, 
                commit_message = ?, commit_author = ?, commit_date = ?, 
                repository = ?, branch = ?, priority = ?, due_date = ? 
                WHERE id = ?`,
                [title, description, status, commit_hash,
                 commit_message, commit_author, commit_date,
                 repository, branch, priority, due_date, id]
            );
            res.json({ success: true, message: '数据源更新成功' });
        } catch (error) {
            console.error('更新数据源失败:', error);
            res.status(500).json({ success: false, message: '更新数据源失败', error: error.message });
        }
    },

    deleteDataSource: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute('DELETE FROM data_sources WHERE id = ?', [id]);
            res.json({ success: true, message: '数据源删除成功' });
        } catch (error) {
            console.error('删除数据源失败:', error);
            res.status(500).json({ success: false, message: '删除数据源失败', error: error.message });
        }
    },

    importGitCommits: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const { commits, week_start, week_end, user_id, repository, branch } = req.body;
            const importedIds = [];
            for (const commit of commits) {
                const [result] = await connection.execute(
                    `INSERT INTO data_sources 
                    (source_type, title, description, status, commit_hash, commit_message, 
                    commit_author, commit_date, repository, branch, user_id, week_start, week_end) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    ['git', commit.message.substring(0, 200), commit.message, 'completed',
                     commit.hash, commit.message, commit.author, commit.date,
                     repository || commit.repository, branch || commit.branch,
                     user_id || 1, week_start, week_end]
                );
                importedIds.push(result.insertId);
            }
            await connection.commit();
            res.json({ success: true, message: `成功导入 ${commits.length} 条 Git 提交记录`, data: { imported_count: commits.length, ids: importedIds } });
        } catch (error) {
            await connection.rollback();
            console.error('导入Git提交记录失败:', error);
            res.status(500).json({ success: false, message: '导入Git提交记录失败', error: error.message });
        } finally {
            connection.release();
        }
    },

    batchCreateDataSources: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const { items, week_start, week_end, user_id } = req.body;
            const createdIds = [];
            for (const item of items) {
                const [result] = await connection.execute(
                    `INSERT INTO data_sources 
                    (source_type, title, description, status, priority, due_date, user_id, week_start, week_end) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [item.source_type || 'manual', item.title, item.description || '',
                     item.status || 'pending', item.priority || 'medium',
                     item.due_date || null, user_id || 1, week_start, week_end]
                );
                createdIds.push(result.insertId);
            }
            await connection.commit();
            res.json({ success: true, message: `成功创建 ${items.length} 条数据源`, data: { created_count: items.length, ids: createdIds } });
        } catch (error) {
            await connection.rollback();
            console.error('批量创建数据源失败:', error);
            res.status(500).json({ success: false, message: '批量创建数据源失败', error: error.message });
        } finally {
            connection.release();
        }
    }
};

module.exports = dataSourceController;
