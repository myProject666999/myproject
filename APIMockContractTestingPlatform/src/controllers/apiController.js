const db = require('../config/database');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');
const openapiParser = require('../services/openapiParser');

async function getApis(req, res, next) {
  try {
    const { projectId, page = 1, pageSize = 20, tag, keyword, method } = req.query;
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

    if (tag) {
      whereClause += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    if (keyword) {
      whereClause += ' AND (path LIKE ? OR summary LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (method) {
      whereClause += ' AND method = ?';
      params.push(method.toUpperCase());
    }

    const countResult = await db.getOne(
      `SELECT COUNT(*) as total FROM apis WHERE ${whereClause}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const apis = await db.query(
      `SELECT a.*, 
       (SELECT COUNT(*) FROM mock_rules WHERE api_id = a.id AND is_active = 1) as rule_count
       FROM apis a 
       WHERE ${whereClause} 
       ORDER BY a.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );

    paginate(res, apis, countResult.total, parseInt(page), parseInt(pageSize));
  } catch (error) {
    next(error);
  }
}

async function getApi(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const api = await db.getOne(
      `SELECT a.*, p.name as project_name 
       FROM apis a 
       LEFT JOIN projects p ON a.project_id = p.id 
       WHERE a.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)`,
      [id, userId]
    );

    if (!api) {
      return next(new AppError('API不存在或无权限访问', 404));
    }

    const schemas = await db.query('SELECT * FROM api_schemas WHERE api_id = ?', [id]);
    const rules = await db.query('SELECT * FROM mock_rules WHERE api_id = ? ORDER BY priority DESC', [id]);

    success(res, { ...api, schemas, rules });
  } catch (error) {
    next(error);
  }
}

async function createApi(req, res, next) {
  try {
    const { projectId, path, method, summary, description, tags, operationId, schemas } = req.body;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT id FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))',
      [projectId, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限操作', 404));
    }

    const apiId = await db.insert('apis', {
      project_id: projectId,
      path,
      method: method.toUpperCase(),
      summary: summary || '',
      description: description || '',
      tags: tags ? tags.join(',') : '',
      operation_id: operationId || ''
    });

    if (schemas && Array.isArray(schemas)) {
      for (const schema of schemas) {
        await db.insert('api_schemas', {
          api_id: apiId,
          type: schema.type,
          content_type: schema.content_type || 'application/json',
          status_code: schema.status_code || '',
          schema: JSON.stringify(schema.schema || {})
        });
      }
    }

    const api = await db.getOne('SELECT * FROM apis WHERE id = ?', [apiId]);
    success(res, api, '创建成功', 201);
  } catch (error) {
    next(error);
  }
}

async function updateApi(req, res, next) {
  try {
    const { id } = req.params;
    const { path, method, summary, description, tags, operationId } = req.body;
    const userId = req.user.id;

    const api = await db.getOne(
      `SELECT a.id FROM apis a 
       JOIN projects p ON a.project_id = p.id 
       WHERE a.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))`,
      [id, userId]
    );

    if (!api) {
      return next(new AppError('API不存在或无权限修改', 404));
    }

    await db.update(
      'apis',
      {
        path,
        method: method?.toUpperCase(),
        summary,
        description,
        tags: tags ? tags.join(',') : tags,
        operation_id: operationId
      },
      'id = ?',
      [id]
    );

    const updatedApi = await db.getOne('SELECT * FROM apis WHERE id = ?', [id]);
    success(res, updatedApi, '更新成功');
  } catch (error) {
    next(error);
  }
}

async function deleteApi(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const api = await db.getOne(
      `SELECT a.id FROM apis a 
       JOIN projects p ON a.project_id = p.id 
       WHERE a.id = ? AND p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))`,
      [id, userId]
    );

    if (!api) {
      return next(new AppError('API不存在或无权限删除', 404));
    }

    await db.remove('apis', 'id = ?', [id]);
    success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
}

async function importOpenAPI(req, res, next) {
  try {
    const { projectId, url, content } = req.body;
    const userId = req.user.id;

    const project = await db.getOne(
      'SELECT * FROM projects WHERE id = ? AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND role IN ("owner", "admin"))',
      [projectId, userId]
    );

    if (!project) {
      return next(new AppError('项目不存在或无权限操作', 404));
    }

    let parsedSpec;
    try {
      if (url) {
        parsedSpec = await openapiParser.parseFromUrl(url);
      } else if (content) {
        parsedSpec = openapiParser.parse(content);
      } else if (req.file) {
        parsedSpec = await openapiParser.parseFromFile(req.file.path);
      } else {
        return next(new AppError('请提供OpenAPI文档URL、内容或上传文件', 400));
      }
    } catch (error) {
      return next(new AppError(`解析OpenAPI文档失败: ${error.message}`, 400));
    }

    let importedCount = 0;
    const errors = [];

    for (const apiSpec of parsedSpec.paths) {
      try {
        const existingApi = await db.getOne(
          'SELECT id FROM apis WHERE project_id = ? AND path = ? AND method = ?',
          [projectId, apiSpec.path, apiSpec.method]
        );

        let apiId;
        if (existingApi) {
          await db.update(
            'apis',
            {
              summary: apiSpec.summary,
              description: apiSpec.description,
              tags: apiSpec.tags?.join(',') || '',
              operation_id: apiSpec.operationId
            },
            'id = ?',
            [existingApi.id]
          );
          apiId = existingApi.id;
        } else {
          apiId = await db.insert('apis', {
            project_id: projectId,
            path: apiSpec.path,
            method: apiSpec.method,
            summary: apiSpec.summary,
            description: apiSpec.description,
            tags: apiSpec.tags?.join(',') || '',
            operation_id: apiSpec.operationId
          });
        }

        if (apiSpec.requestBody) {
          await db.remove('api_schemas', 'api_id = ? AND type = ?', [apiId, 'request']);
          for (const [contentType, mediaType] of Object.entries(apiSpec.requestBody.content || {})) {
            await db.insert('api_schemas', {
              api_id: apiId,
              type: 'request',
              content_type: contentType,
              schema: JSON.stringify(mediaType.schema || {})
            });
          }
        }

        if (apiSpec.responses) {
          for (const [statusCode, response] of Object.entries(apiSpec.responses)) {
            for (const [contentType, mediaType] of Object.entries(response.content || {})) {
              await db.insert('api_schemas', {
                api_id: apiId,
                type: 'response',
                content_type: contentType,
                status_code: statusCode,
                schema: JSON.stringify(mediaType.schema || {})
              });
            }
          }
        }

        importedCount++;
      } catch (error) {
        errors.push(`${apiSpec.method} ${apiSpec.path}: ${error.message}`);
      }
    }

    await db.update(
      'projects',
      { openapi_spec: JSON.stringify(parsedSpec) },
      'id = ?',
      [projectId]
    );

    success(res, {
      imported: importedCount,
      total: parsedSpec.paths.length,
      errors
    }, '导入完成');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getApis,
  getApi,
  createApi,
  updateApi,
  deleteApi,
  importOpenAPI
};
