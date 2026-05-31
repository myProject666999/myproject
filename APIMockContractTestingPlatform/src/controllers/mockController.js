const db = require('../config/database');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');
const mockEngine = require('../services/mockEngine');

async function getScenarios(req, res, next) {
  try {
    const { projectId } = req.query;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT id FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)',
      [projectId, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限访问', 404));
    }

    const scenarios = await db.query(
      'SELECT * FROM mock_scenarios WHERE project_id = ? ORDER BY is_default DESC, created_at ASC',
      [projectId]
    );

    success(res, scenarios);
  } catch (error) {
    next(error);
  }
}

async function createScenario(req, res, next) {
  try {
    const { projectId, name, description, isActive } = req.body;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT id FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))',
      [projectId, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限操作', 404));
    }

    if (isActive) {
      await db.update('mock_scenarios', { is_active: false }, 'project_id = ?', [projectId]);
    }

    const scenarioId = await db.insert('mock_scenarios', {
      project_id: projectId,
      name,
      description: description || '',
      is_active: isActive || false,
      is_default: false,
      created_by: userId
    });

    const scenario = await db.getOne('SELECT * FROM mock_scenarios WHERE id = ?', [scenarioId]);
    success(res, scenario, '创建成功', 201);
  } catch (error) {
    next(error);
  }
}

async function setActiveScenario(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const scenario = await db.getOne(
      `SELECT s.* FROM mock_scenarios s 
       JOIN projects p ON s.project_id = p.id 
       WHERE s.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))`,
      [id, userId]
    );

    if (!scenario) {
      return next(new AppError('场景不存在或无权限操作', 404));
    }

    await db.update('mock_scenarios', { is_active: false }, 'project_id = ?', [scenario.project_id]);
    await db.update('mock_scenarios', { is_active: true }, 'id = ?', [id]);

    success(res, null, '设置成功');
  } catch (error) {
    next(error);
  }
}

async function getRules(req, res, next) {
  try {
    const { apiId, scenarioId, page = 1, pageSize = 20 } = req.query;
    const userId = req.user.id;

    const api = await db.getOne(
      `SELECT a.id FROM apis a 
       JOIN projects p ON a.project_id = p.id 
       WHERE a.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)`,
      [apiId, userId]
    );

    if (!api) {
      return next(new AppError('API不存在或无权限访问', 404));
    }

    let whereClause = 'api_id = ?';
    let params = [apiId];

    if (scenarioId) {
      whereClause += ' AND scenario_id = ?';
      params.push(scenarioId);
    }

    const countResult = await db.getOne(
      `SELECT COUNT(*) as total FROM mock_rules WHERE ${whereClause}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const rules = await db.query(
      `SELECT r.*, s.name as scenario_name 
       FROM mock_rules r 
       LEFT JOIN mock_scenarios s ON r.scenario_id = s.id 
       WHERE ${whereClause} 
       ORDER BY priority DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );

    paginate(res, rules, countResult.total, parseInt(page), parseInt(pageSize));
  } catch (error) {
    next(error);
  }
}

async function createRule(req, res, next) {
  try {
    const { apiId, scenarioId, name, ruleType, priority, isActive, conditions, responseTemplate, responseStatus, responseHeaders, delayMs } = req.body;
    const userId = req.user.id;

    const api = await db.getOne(
      `SELECT a.id, a.project_id FROM apis a 
       JOIN projects p ON a.project_id = p.id 
       WHERE a.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))`,
      [apiId, userId]
    );

    if (!api) {
      return next(new AppError('API不存在或无权限操作', 404));
    }

    const ruleId = await db.insert('mock_rules', {
      api_id: apiId,
      scenario_id: scenarioId || null,
      name,
      rule_type: ruleType,
      priority: priority || 0,
      is_active: isActive !== false,
      conditions: conditions ? JSON.stringify(conditions) : null,
      response_template: responseTemplate ? JSON.stringify(responseTemplate) : null,
      response_status: responseStatus || 200,
      response_headers: responseHeaders ? JSON.stringify(responseHeaders) : null,
      delay_ms: delayMs || 0
    });

    const rule = await db.getOne('SELECT * FROM mock_rules WHERE id = ?', [ruleId]);
    success(res, rule, '创建成功', 201);
  } catch (error) {
    next(error);
  }
}

async function updateRule(req, res, next) {
  try {
    const { id } = req.params;
    const { name, ruleType, priority, isActive, conditions, responseTemplate, responseStatus, responseHeaders, delayMs } = req.body;
    const userId = req.user.id;

    const rule = await db.getOne(
      `SELECT r.id FROM mock_rules r 
       JOIN apis a ON r.api_id = a.id 
       JOIN projects p ON a.project_id = p.id 
       WHERE r.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))`,
      [id, userId]
    );

    if (!rule) {
      return next(new AppError('规则不存在或无权限修改', 404));
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (ruleType !== undefined) updateData.rule_type = ruleType;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (conditions !== undefined) updateData.conditions = JSON.stringify(conditions);
    if (responseTemplate !== undefined) updateData.response_template = JSON.stringify(responseTemplate);
    if (responseStatus !== undefined) updateData.response_status = responseStatus;
    if (responseHeaders !== undefined) updateData.response_headers = JSON.stringify(responseHeaders);
    if (delayMs !== undefined) updateData.delay_ms = delayMs;

    await db.update('mock_rules', updateData, 'id = ?', [id]);

    const updatedRule = await db.getOne('SELECT * FROM mock_rules WHERE id = ?', [id]);
    success(res, updatedRule, '更新成功');
  } catch (error) {
    next(error);
  }
}

async function deleteRule(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const rule = await db.getOne(
      `SELECT r.id FROM mock_rules r 
       JOIN apis a ON r.api_id = a.id 
       JOIN projects p ON a.project_id = p.id 
       WHERE r.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))`,
      [id, userId]
    );

    if (!rule) {
      return next(new AppError('规则不存在或无权限删除', 404));
    }

    await db.remove('mock_rules', 'id = ?', [id]);
    success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getScenarios,
  createScenario,
  setActiveScenario,
  getRules,
  createRule,
  updateRule,
  deleteRule
};
