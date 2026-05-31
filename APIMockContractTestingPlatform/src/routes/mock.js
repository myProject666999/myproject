const express = require('express');
const router = express.Router();
const mockEngine = require('../services/mockEngine');
const db = require('../config/database');
const logController = require('../controllers/logController');

router.use(async (req, res, next) => {
  const startTime = Date.now();
  const projectId = req.headers['x-project-id'];

  if (!projectId) {
    return res.status(400).json({ error: '缺少X-Project-ID请求头' });
  }

  try {
    const project = await db.getOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const scenario = await mockEngine.getActiveScenario(projectId);
    const scenarioId = scenario ? scenario.id : null;

    const baseUrl = project.base_url || '';
    let requestPath = req.path;
    if (baseUrl && requestPath.startsWith(baseUrl)) {
      requestPath = requestPath.substring(baseUrl.length);
    }

    const apis = await db.query(
      'SELECT * FROM apis WHERE project_id = ? AND method = ?',
      [projectId, req.method.toUpperCase()]
    );

    let matchedApi = null;
    for (const api of apis) {
      const apiPathRegex = new RegExp(
        '^' + api.path.replace(/\{[^}]+\}/g, '([^/]+)').replace(/\//g, '\\/') + '$'
      );

      if (apiPathRegex.test(requestPath)) {
        const pathParams = mockEngine.extractPathParams(api.path, requestPath);
        matchedApi = { ...api, pathParams };
        break;
      }
    }

    if (!matchedApi) {
      return res.status(404).json({ error: '未找到匹配的API定义' });
    }

    const mockRequest = {
      ...req,
      params: { ...req.params, ...matchedApi.pathParams },
      path: requestPath
    };

    const cacheKey = mockEngine.generateCacheKey(matchedApi.id, scenarioId, mockRequest);
    const cachedResponse = await mockEngine.getFromCache(cacheKey);

    if (cachedResponse) {
      const responseTime = Date.now() - startTime;
      await logController.createLog({
        projectId,
        apiId: matchedApi.id,
        scenarioId,
        requestMethod: req.method,
        requestPath: requestPath,
        requestHeaders: req.headers,
        requestBody: JSON.stringify(req.body),
        responseStatus: cachedResponse.status,
        responseHeaders: cachedResponse.headers,
        responseBody: JSON.stringify(cachedResponse.body),
        responseTimeMs: responseTime,
        clientIp: req.ip,
        userAgent: req.headers['user-agent'],
        matchedRuleId: cachedResponse.ruleId,
        isFromCache: true
      });

      res.set(cachedResponse.headers || {});
      return res.status(cachedResponse.status).json(cachedResponse.body);
    }

    const rule = await mockEngine.findMatchingRule(matchedApi.id, scenarioId, mockRequest);

    if (!rule) {
      const responseTime = Date.now() - startTime;
      await logController.createLog({
        projectId,
        apiId: matchedApi.id,
        scenarioId,
        requestMethod: req.method,
        requestPath: requestPath,
        requestHeaders: req.headers,
        requestBody: JSON.stringify(req.body),
        responseStatus: 500,
        responseTimeMs: responseTime,
        clientIp: req.ip,
        userAgent: req.headers['user-agent'],
        isFromCache: false
      });

      return res.status(500).json({ error: '未找到匹配的Mock规则' });
    }

    const response = await mockEngine.generateResponse(rule, mockRequest);

    if (response.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, response.delay));
    }

    const responseTime = Date.now() - startTime;
    await logController.createLog({
      projectId,
      apiId: matchedApi.id,
      scenarioId,
      requestMethod: req.method,
      requestPath: requestPath,
      requestHeaders: req.headers,
      requestBody: JSON.stringify(req.body),
      responseStatus: response.status,
      responseHeaders: response.headers,
      responseBody: JSON.stringify(response.body),
      responseTimeMs: responseTime,
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      matchedRuleId: rule.id,
      isFromCache: false
    });

    if (rule.rule_type !== 'random') {
      await mockEngine.setToCache(cacheKey, {
        status: response.status,
        headers: response.headers,
        body: response.body,
        ruleId: rule.id
      }, parseInt(process.env.MOCK_CACHE_TTL) || 300);
    }

    res.set(response.headers || {});
    res.status(response.status).json(response.body);

  } catch (error) {
    console.error('Mock请求处理错误:', error);
    res.status(500).json({ error: 'Mock服务内部错误', message: error.message });
  }
});

module.exports = router;
