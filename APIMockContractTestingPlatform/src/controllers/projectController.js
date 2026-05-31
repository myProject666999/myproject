const db = require('../config/database');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');

async function getProjects(req, res, next) {
  try {
    const { page = 1, pageSize = 10, teamId } = req.query;
    const userId = req.user.id;

    let whereClause = 'p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)';
    let params = [userId];

    if (teamId) {
      whereClause += ' AND p.team_id = ?';
      params.push(teamId);
    }

    const countResult = await db.getOne(
      `SELECT COUNT(*) as total FROM projects p WHERE ${whereClause}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const projects = await db.query(
      `SELECT p.*, t.name as team_name, 
       (SELECT COUNT(*) FROM apis WHERE project_id = p.id) as api_count
       FROM projects p 
       LEFT JOIN teams t ON p.team_id = t.id 
       WHERE ${whereClause} 
       ORDER BY p.updated_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );

    paginate(res, projects, countResult.total, parseInt(page), parseInt(pageSize));
  } catch (error) {
    next(error);
  }
}

async function getProject(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await db.getOne(
      `SELECT p.*, t.name as team_name 
       FROM projects p 
       LEFT JOIN teams t ON p.team_id = t.id 
       WHERE p.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)`,
      [id, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限访问', 404));
    }

    success(res, project);
  } catch (error) {
    next(error);
  }
}

async function createProject(req, res, next) {
  try {
    const { teamId, name, description, baseUrl } = req.body;
    const userId = req.user.id;

    const teamMember = await db.getOne(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );

    if (!teamMember || !['owner', 'admin'].includes(teamMember.role)) {
      return next(new AppError('无权限在该团队创建项目', 403));
    }

    const projectId = await db.insert('projects', {
      team_id: teamId,
      name,
      description: description || '',
      base_url: baseUrl || '',
      created_by: userId
    });

    await db.insert('environments', {
      project_id: projectId,
      name: 'dev',
      base_url: 'http://localhost:3000',
      is_default: true
    });

    await db.insert('mock_scenarios', {
      project_id: projectId,
      name: '默认场景',
      description: '默认Mock场景',
      is_default: true,
      is_active: true,
      created_by: userId
    });

    const project = await db.getOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    success(res, project, '创建成功', 201);
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, baseUrl } = req.body;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT * FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))',
      [id, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限修改', 404));
    }

    await db.update(
      'projects',
      { name, description, base_url: baseUrl },
      'id = ?',
      [id]
    );

    const updatedProject = await db.getOne('SELECT * FROM projects WHERE id = ?', [id]);
    success(res, updatedProject, '更新成功');
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT * FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role = "owner")',
      [id, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限删除', 404));
    }

    await db.remove('projects', 'id = ?', [id]);
    success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};
