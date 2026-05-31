const faker = require('faker');
const db = require('../config/database');
const redis = require('../config/redis');

class MockEngine {
  constructor() {
    faker.locale = 'zh_CN';
  }

  async findMatchingRule(apiId, scenarioId, request) {
    const rules = await db.query(
      `SELECT * FROM mock_rules 
       WHERE api_id = ? AND is_active = 1 
       AND (scenario_id = ? OR scenario_id IS NULL)
       ORDER BY priority DESC, scenario_id IS NULL ASC`,
      [apiId, scenarioId]
    );

    for (const rule of rules) {
      if (rule.rule_type === 'conditional') {
        if (this.matchConditions(rule.conditions, request)) {
          return rule;
        }
      } else {
        return rule;
      }
    }

    return null;
  }

  matchConditions(conditions, request) {
    if (!conditions) return true;

    try {
      const conds = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;

      if (conds.queryParams) {
        for (const [key, value] of Object.entries(conds.queryParams)) {
          if (request.query[key] !== value) {
            return false;
          }
        }
      }

      if (conds.headers) {
        for (const [key, value] of Object.entries(conds.headers)) {
          if (request.headers[key.toLowerCase()] !== value) {
            return false;
          }
        }
      }

      if (conds.body) {
        for (const [key, value] of Object.entries(conds.body)) {
          if (request.body[key] !== value) {
            return false;
          }
        }
      }

      if (conds.pathParams) {
        for (const [key, value] of Object.entries(conds.pathParams)) {
          if (request.params[key] !== value) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('条件匹配错误:', error);
      return false;
    }
  }

  async generateResponse(rule, request) {
    let responseTemplate;
    try {
      responseTemplate = typeof rule.response_template === 'string'
        ? JSON.parse(rule.response_template)
        : rule.response_template;
    } catch (error) {
      responseTemplate = rule.response_template;
    }

    let response = responseTemplate;

    if (rule.rule_type === 'random') {
      response = this.processFakerTemplate(responseTemplate, request);
    } else if (rule.rule_type === 'template') {
      response = this.processTemplateVariables(responseTemplate, request);
    }

    return {
      status: rule.response_status || 200,
      headers: this.parseHeaders(rule.response_headers),
      body: response,
      delay: rule.delay_ms || 0
    };
  }

  processFakerTemplate(template, request) {
    if (template === null || template === undefined) {
      return template;
    }

    if (typeof template === 'string') {
      let result = template;

      const fakerRegex = /\{\{([\w.]+)(?:\s+([^}]+))?\}\}/g;
      result = result.replace(fakerRegex, (match, method, args) => {
        try {
          const [namespace, func] = method.split('.');
          if (faker[namespace] && typeof faker[namespace][func] === 'function') {
            const argArray = args ? this.parseArgs(args) : [];
            return faker[namespace][func](...argArray);
          }
          return match;
        } catch (error) {
          return match;
        }
      });

      result = result.replace(/\{\{now\}\}/g, new Date().toISOString());
      result = result.replace(/\{\{timestamp\}\}/g, Date.now().toString());
      result = result.replace(/\{\{uuid\}\}/g, require('uuid').v4());

      result = this.processRequestVariables(result, request);

      return result;
    }

    if (Array.isArray(template)) {
      return template.map(item => this.processFakerTemplate(item, request));
    }

    if (typeof template === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(template)) {
        result[key] = this.processFakerTemplate(value, request);
      }
      return result;
    }

    return template;
  }

  processTemplateVariables(template, request) {
    if (template === null || template === undefined) {
      return template;
    }

    if (typeof template === 'string') {
      let result = template;
      result = result.replace(/\{\{now\}\}/g, new Date().toISOString());
      result = result.replace(/\{\{timestamp\}\}/g, Date.now().toString());
      result = result.replace(/\{\{uuid\}\}/g, require('uuid').v4());
      result = this.processRequestVariables(result, request);
      return result;
    }

    if (Array.isArray(template)) {
      return template.map(item => this.processTemplateVariables(item, request));
    }

    if (typeof template === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(template)) {
        result[key] = this.processTemplateVariables(value, request);
      }
      return result;
    }

    return template;
  }

  processRequestVariables(str, request) {
    if (typeof str !== 'string') return str;

    let result = str;

    if (request.params) {
      for (const [key, value] of Object.entries(request.params)) {
        result = result.replace(new RegExp(`\\$\\{request\\.params\\.${key}\\}`, 'g'), String(value));
      }
    }

    if (request.query) {
      for (const [key, value] of Object.entries(request.query)) {
        result = result.replace(new RegExp(`\\$\\{request\\.query\\.${key}\\}`, 'g'), String(value));
      }
    }

    if (request.body && typeof request.body === 'object') {
      for (const [key, value] of Object.entries(request.body)) {
        if (typeof value === 'string' || typeof value === 'number') {
          result = result.replace(new RegExp(`\\$\\{request\\.body\\.${key}\\}`, 'g'), String(value));
        }
      }
    }

    return result;
  }

  parseArgs(argsStr) {
    try {
      return JSON.parse(`[${argsStr}]`);
    } catch (error) {
      return argsStr.split(',').map(arg => {
        arg = arg.trim();
        if (arg.startsWith('"') && arg.endsWith('"')) {
          return arg.slice(1, -1);
        }
        if (arg === 'true') return true;
        if (arg === 'false') return false;
        if (!isNaN(arg)) return Number(arg);
        return arg;
      });
    }
  }

  parseHeaders(headers) {
    if (!headers) return {};
    try {
      return typeof headers === 'string' ? JSON.parse(headers) : headers;
    } catch (error) {
      return {};
    }
  }

  async getFromCache(cacheKey) {
    try {
      const cached = await redis.get(`mock:cache:${cacheKey}`);
      return cached;
    } catch (error) {
      return null;
    }
  }

  async setToCache(cacheKey, response, ttl = 300) {
    try {
      await redis.set(`mock:cache:${cacheKey}`, response, ttl);
    } catch (error) {
    }
  }

  generateCacheKey(apiId, scenarioId, request) {
    const parts = [
      apiId,
      scenarioId || 'default',
      request.method,
      request.path,
      JSON.stringify(request.query || {}),
      JSON.stringify(request.body || {})
    ];
    return require('crypto').createHash('md5').update(parts.join(':')).digest('hex');
  }

  async getActiveScenario(projectId) {
    return await db.getOne(
      'SELECT * FROM mock_scenarios WHERE project_id = ? AND is_active = 1 LIMIT 1',
      [projectId]
    );
  }

  findApiByPath(projectId, method, path) {
    return db.getOne(
      'SELECT * FROM apis WHERE project_id = ? AND method = ?',
      [projectId, method.toUpperCase()]
    ).then(api => {
      if (!api) return null;

      const apiPathRegex = new RegExp(
        '^' + api.path.replace(/\{[^}]+\}/g, '([^/]+)').replace(/\//g, '\\/') + '$'
      );

      if (apiPathRegex.test(path)) {
        const pathParams = this.extractPathParams(api.path, path);
        return { ...api, pathParams };
      }

      return null;
    });
  }

  extractPathParams(templatePath, actualPath) {
    const params = {};
    const templateParts = templatePath.split('/');
    const actualParts = actualPath.split('/');

    templateParts.forEach((part, index) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const paramName = part.slice(1, -1);
        params[paramName] = actualParts[index];
      }
    });

    return params;
  }
}

module.exports = new MockEngine();
