const db = require('../config/database');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');

async function getAccessLogs(req, res, next) {
  try {
    const { projectId, apiId, startDate, endDate, status, page = 1, pageSize = 50 } = req.query;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT id FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)',
      [projectId, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限访问', 404));
    }

    let whereClause = 'l.project_id = ?';
    let params = [projectId];

    if (apiId) {
      whereClause += ' AND l.api_id = ?';
      params.push(apiId);
    }

    if (startDate) {
      whereClause += ' AND l.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND l.created_at <= ?';
      params.push(endDate + ' 23:59:59');
    }

    if (status) {
      whereClause += ' AND l.response_status = ?';
      params.push(status);
    }

    const countResult = await db.getOne(
      `SELECT COUNT(*) as total FROM access_logs l WHERE ${whereClause}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const logs = await db.query(
      `SELECT l.*, a.path, a.method, a.summary, s.name as scenario_name, e.name as environment_name 
       FROM access_logs l 
       LEFT JOIN apis a ON l.api_id = a.id 
       LEFT JOIN mock_scenarios s ON l.scenario_id = s.id 
       LEFT JOIN environments e ON l.environment_id = e.id 
       WHERE ${whereClause} 
       ORDER BY l.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );

    paginate(res, logs, countResult.total, parseInt(page), parseInt(pageSize));
  } catch (error) {
    next(error);
  }
}

async function getLogStatistics(req, res, next) {
  try {
    const { projectId, apiId, startDate, endDate } = req.query;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT id FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)',
      [projectId, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限访问', 404));
    }

    let whereClause = 'project_id = ?';
    let params = [projectId];

    if (apiId) {
      whereClause += ' AND api_id = ?';
      params.push(apiId);
    }

    if (startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(endDate + ' 23:59:59');
    }

    const totalResult = await db.getOne(
      `SELECT COUNT(*) as total FROM access_logs WHERE ${whereClause}`,
      params
    );

    const successResult = await db.getOne(
      `SELECT COUNT(*) as success_count FROM access_logs WHERE ${whereClause} AND response_status >= 200 AND response_status < 300`,
      params
    );

    const errorResult = await db.getOne(
      `SELECT COUNT(*) as error_count FROM access_logs WHERE ${whereClause} AND response_status >= 400`,
      params
    );

    const avgResponseTime = await db.getOne(
      `SELECT AVG(response_time_ms) as avg_time FROM access_logs WHERE ${whereClause} AND response_time_ms IS NOT NULL`,
      params
    );

    const topApis = await db.query(
      `SELECT api_id, a.path, a.method, COUNT(*) as count 
       FROM access_logs l 
       LEFT JOIN apis a ON l.api_id = a.id 
       WHERE ${whereClause} AND api_id IS NOT NULL 
       GROUP BY api_id 
       ORDER BY count DESC 
       LIMIT 10`,
      params
    );

    const dailyStats = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count, 
       SUM(CASE WHEN response_status >= 200 AND response_status < 300 THEN 1 ELSE 0 END) as success_count,
       SUM(CASE WHEN response_status >= 400 THEN 1 ELSE 0 END) as error_count
       FROM access_logs 
       WHERE ${whereClause} 
       GROUP BY DATE(created_at) 
       ORDER BY date DESC 
       LIMIT 30`,
      params
    );

    success(res, {
      total: totalResult.total,
      success: successResult.success_count,
      error: errorResult.error_count,
      avgResponseTime: avgResponseTime.avg_time || 0,
      topApis,
      dailyStats
    });
  } catch (error) {
    next(error);
  }
}

async function createLog(data) {
  try {
    return await db.insert('access_logs', {
      project_id: data.projectId,
      api_id: data.apiId || null,
      scenario_id: data.scenarioId || null,
      environment_id: data.environmentId || null,
      request_method: data.requestMethod,
      request_path: data.requestPath,
      request_headers: data.requestHeaders ? JSON.stringify(data.requestHeaders) : null,
      request_body: data.requestBody || null,
      response_status: data.responseStatus || null,
      response_headers: data.responseHeaders ? JSON.stringify(data.responseHeaders) : null,
      response_body: data.responseBody || null,
      response_time_ms: data.responseTimeMs || null,
      client_ip: data.clientIp || null,
      user_agent: data.userAgent || null,
      matched_rule_id: data.matchedRuleId || null,
      is_from_cache: data.isFromCache || false
    });
  } catch (error) {
    console.error('创建访问日志失败:', error);
  }
}

module.exports = {
  getAccessLogs,
  getLogStatistics,
  createLog
};
