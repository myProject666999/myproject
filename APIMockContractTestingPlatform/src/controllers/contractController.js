const db = require('../config/database');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');
const contractValidator = require('../services/contractValidator');

async function getTests(req, res, next) {
  try {
    const { projectId, page = 1, pageSize = 20 } = req.query;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT id FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)',
      [projectId, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限访问', 404));
    }

    const countResult = await db.getOne(
      'SELECT COUNT(*) as total FROM contract_tests WHERE project_id = ?',
      [projectId]
    );

    const offset = (page - 1) * pageSize;
    const tests = await db.query(
      `SELECT t.*, u.username as creator_name 
       FROM contract_tests t 
       LEFT JOIN users u ON t.created_by = u.id 
       WHERE t.project_id = ? 
       ORDER BY t.updated_at DESC 
       LIMIT ? OFFSET ?`,
      [projectId, parseInt(pageSize), parseInt(offset)]
    );

    paginate(res, tests, countResult.total, parseInt(page), parseInt(pageSize));
  } catch (error) {
    next(error);
  }
}

async function createTest(req, res, next) {
  try {
    const { projectId, name, description, testConfig } = req.body;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT id FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))',
      [projectId, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限操作', 404));
    }

    const testId = await db.insert('contract_tests', {
      project_id: projectId,
      name,
      description: description || '',
      test_config: testConfig ? JSON.stringify(testConfig) : null,
      created_by: userId
    });

    const test = await db.getOne('SELECT * FROM contract_tests WHERE id = ?', [testId]);
    success(res, test, '创建成功', 201);
  } catch (error) {
    next(error);
  }
}

async function runTest(req, res, next) {
  try {
    const { id } = req.params;
    const { environmentId } = req.body;
    const userId = req.user.id;

    const test = await db.getOne(
      `SELECT t.* FROM contract_tests t 
       JOIN projects p ON t.project_id = p.id 
       WHERE t.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)`,
      [id, userId]
    );

    if (!test) {
      return next(new AppError('测试不存在或无权限执行', 404));
    }

    const result = await contractValidator.runContractTest(id, environmentId, userId);
    success(res, result, '测试执行完成');
  } catch (error) {
    next(error);
  }
}

async function getReports(req, res, next) {
  try {
    const { testId, page = 1, pageSize = 20 } = req.query;
    const userId = req.user.id;

    const test = await db.getOne(
      `SELECT t.id FROM contract_tests t 
       JOIN projects p ON t.project_id = p.id 
       WHERE t.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)`,
      [testId, userId]
    );

    if (!test) {
      return next(new AppError('测试不存在或无权限访问', 404));
    }

    const countResult = await db.getOne(
      'SELECT COUNT(*) as total FROM contract_reports WHERE test_id = ?',
      [testId]
    );

    const offset = (page - 1) * pageSize;
    const reports = await db.query(
      `SELECT r.*, u.username as executor_name, e.name as environment_name 
       FROM contract_reports r 
       LEFT JOIN users u ON r.executed_by = u.id 
       LEFT JOIN environments e ON r.environment_id = e.id 
       WHERE r.test_id = ? 
       ORDER BY r.executed_at DESC 
       LIMIT ? OFFSET ?`,
      [testId, parseInt(pageSize), parseInt(offset)]
    );

    paginate(res, reports, countResult.total, parseInt(page), parseInt(pageSize));
  } catch (error) {
    next(error);
  }
}

async function getReport(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await db.getOne(
      `SELECT r.*, t.name as test_name, u.username as executor_name, e.name as environment_name 
       FROM contract_reports r 
       JOIN contract_tests t ON r.test_id = t.id 
       JOIN projects p ON t.project_id = p.id 
       LEFT JOIN users u ON r.executed_by = u.id 
       LEFT JOIN environments e ON r.environment_id = e.id 
       WHERE r.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)`,
      [id, userId]
    );

    if (!report) {
      return next(new AppError('报告不存在或无权限访问', 404));
    }

    if (report.summary && typeof report.summary === 'string') {
      report.summary = JSON.parse(report.summary);
    }
    if (report.details && typeof report.details === 'string') {
      report.details = JSON.parse(report.details);
    }

    success(res, report);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTests,
  createTest,
  runTest,
  getReports,
  getReport
};
