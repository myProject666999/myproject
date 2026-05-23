const pool = require('../config/database');

const templateController = {
    getAllTemplates: async (req, res) => {
        try {
            const [rows] = await pool.execute(
                'SELECT t.*, u.username as created_by_name FROM templates t LEFT JOIN users u ON t.created_by = u.id ORDER BY t.is_default DESC, t.created_at DESC'
            );
            const templates = rows.map(template => {
                if (template.variables && typeof template.variables === 'string') {
                    try {
                        template.variables = JSON.parse(template.variables);
                    } catch (e) {
                        console.warn('解析模板 variables 失败:', e);
                    }
                }
                return template;
            });
            res.json({ success: true, data: templates });
        } catch (error) {
            console.error('获取模板列表失败:', error);
            res.status(500).json({ success: false, message: '获取模板列表失败', error: error.message });
        }
    },

    getTemplateById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute('SELECT * FROM templates WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: '模板不存在' });
            }
            const template = rows[0];
            if (template.variables && typeof template.variables === 'string') {
                try {
                    template.variables = JSON.parse(template.variables);
                } catch (e) {
                    console.warn('解析模板 variables 失败:', e);
                }
            }
            res.json({ success: true, data: template });
        } catch (error) {
            console.error('获取模板详情失败:', error);
            res.status(500).json({ success: false, message: '获取模板详情失败', error: error.message });
        }
    },

    createTemplate: async (req, res) => {
        try {
            const { name, description, content, variables, is_default, created_by } = req.body;
            if (is_default) {
                await pool.execute('UPDATE templates SET is_default = 0 WHERE is_default = 1');
            }
            const variablesJson = variables ? JSON.stringify(variables) : null;
            const [result] = await pool.execute(
                'INSERT INTO templates (name, description, content, variables, is_default, created_by) VALUES (?, ?, ?, ?, ?, ?)',
                [name, description, content, variablesJson, is_default || 0, created_by || 1]
            );
            res.json({ success: true, message: '模板创建成功', data: { id: result.insertId } });
        } catch (error) {
            console.error('创建模板失败:', error);
            res.status(500).json({ success: false, message: '创建模板失败', error: error.message });
        }
    },

    updateTemplate: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, content, variables, is_default } = req.body;
            if (is_default) {
                await pool.execute('UPDATE templates SET is_default = 0 WHERE is_default = 1 AND id != ?', [id]);
            }
            const variablesJson = variables ? JSON.stringify(variables) : null;
            await pool.execute(
                'UPDATE templates SET name = ?, description = ?, content = ?, variables = ?, is_default = ? WHERE id = ?',
                [name, description, content, variablesJson, is_default || 0, id]
            );
            res.json({ success: true, message: '模板更新成功' });
        } catch (error) {
            console.error('更新模板失败:', error);
            res.status(500).json({ success: false, message: '更新模板失败', error: error.message });
        }
    },

    deleteTemplate: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute('DELETE FROM templates WHERE id = ?', [id]);
            res.json({ success: true, message: '模板删除成功' });
        } catch (error) {
            console.error('删除模板失败:', error);
            res.status(500).json({ success: false, message: '删除模板失败', error: error.message });
        }
    },

    renderTemplate: async (req, res) => {
        try {
            const { id } = req.params;
            const { data } = req.body;
            const [rows] = await pool.execute('SELECT * FROM templates WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: '模板不存在' });
            }
            const template = rows[0];
            const Handlebars = require('handlebars');
            const compiledTemplate = Handlebars.compile(template.content);
            const renderedContent = compiledTemplate(data || {});
            res.json({ success: true, data: { content: renderedContent } });
        } catch (error) {
            console.error('渲染模板失败:', error);
            res.status(500).json({ success: false, message: '渲染模板失败', error: error.message });
        }
    }
};

module.exports = templateController;
