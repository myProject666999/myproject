const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const db = require('../config/database');

class ContractValidator {
  constructor() {
    this.ajv = new Ajv({
      strict: false,
      allErrors: true,
      verbose: true,
      discriminator: true
    });
    addFormats(this.ajv);
  }

  validateRequest(apiId, request) {
    return this.validate(apiId, 'request', request);
  }

  validateResponse(apiId, response, statusCode = '200') {
    return this.validate(apiId, 'response', response, statusCode);
  }

  async validate(apiId, type, data, statusCode = null) {
    let whereClause = 'api_id = ? AND type = ?';
    let params = [apiId, type];

    if (type === 'response' && statusCode) {
      whereClause += ' AND status_code = ?';
      params.push(statusCode.toString());
    }

    const schemas = await db.query(
      `SELECT * FROM api_schemas WHERE ${whereClause}`,
      params
    );

    if (schemas.length === 0) {
      return {
        valid: true,
        errors: [],
        warning: `未找到${type === 'request' ? '请求' : '响应'}Schema定义`
      };
    }

    const results = [];
    for (const schemaRecord of schemas) {
      try {
        const schema = typeof schemaRecord.schema === 'string'
          ? JSON.parse(schemaRecord.schema)
          : schemaRecord.schema;

        const result = this.validateAgainstSchema(schema, data);
        results.push({
          contentType: schemaRecord.content_type,
          statusCode: schemaRecord.status_code,
          ...result
        });

        if (result.valid) {
          return {
            valid: true,
            errors: [],
            matchedContentType: schemaRecord.content_type
          };
        }
      } catch (error) {
        results.push({
          contentType: schemaRecord.content_type,
          valid: false,
          errors: [{ message: `Schema解析错误: ${error.message}` }]
        });
      }
    }

    const allErrors = results.flatMap(r => r.errors || []);
    return {
      valid: false,
      errors: allErrors,
      details: results
    };
  }

  validateAgainstSchema(schema, data) {
    try {
      const validate = this.ajv.compile(schema);
      const valid = validate(data);

      if (valid) {
        return { valid: true, errors: [] };
      }

      return {
        valid: false,
        errors: validate.errors.map(err => ({
          path: err.instancePath,
          message: err.message,
          keyword: err.keyword,
          params: err.params
        }))
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{ message: `验证错误: ${error.message}` }]
      };
    }
  }

  async runContractTest(testId, environmentId, executedBy) {
    const test = await db.getOne('SELECT * FROM contract_tests WHERE id = ?', [testId]);
    if (!test) {
      throw new Error('测试不存在');
    }

    const testConfig = test.test_config ? JSON.parse(test.test_config) : {};
    const apiIds = testConfig.apiIds || [];

    if (apiIds.length === 0) {
      const projectApis = await db.query(
        'SELECT id FROM apis WHERE project_id = ?',
        [test.project_id]
      );
      apiIds.push(...projectApis.map(a => a.id));
    }

    const results = [];
    let passedCount = 0;
    let failedCount = 0;
    const startTime = Date.now();

    for (const apiId of apiIds) {
      const api = await db.getOne('SELECT * FROM apis WHERE id = ?', [apiId]);
      if (!api) continue;

      const apiResult = await this.validateApiContract(api, environmentId);
      results.push(apiResult);

      if (apiResult.valid) {
        passedCount++;
      } else {
        failedCount++;
      }
    }

    const durationMs = Date.now() - startTime;
    const status = failedCount === 0 ? 'passed' : 'failed';

    const reportId = await db.insert('contract_reports', {
      test_id: testId,
      environment_id: environmentId || null,
      status,
      summary: JSON.stringify({
        total: results.length,
        passed: passedCount,
        failed: failedCount
      }),
      details: JSON.stringify(results),
      duration_ms: durationMs,
      executed_by: executedBy || null
    });

    await db.update(
      'contract_tests',
      {
        last_run_at: new Date(),
        last_status: status
      },
      'id = ?',
      [testId]
    );

    return {
      reportId,
      status,
      summary: {
        total: results.length,
        passed: passedCount,
        failed: failedCount
      },
      durationMs
    };
  }

  async validateApiContract(api, environmentId) {
    const requestSchemas = await db.query(
      'SELECT * FROM api_schemas WHERE api_id = ? AND type = "request"',
      [api.id]
    );

    const responseSchemas = await db.query(
      'SELECT * FROM api_schemas WHERE api_id = ? AND type = "response"',
      [api.id]
    );

    const issues = [];

    if (requestSchemas.length === 0 && api.method !== 'GET' && api.method !== 'DELETE') {
      issues.push({
        type: 'warning',
        message: '缺少请求体Schema定义'
      });
    }

    if (responseSchemas.length === 0) {
      issues.push({
        type: 'warning',
        message: '缺少响应体Schema定义'
      });
    }

    for (const schema of responseSchemas) {
      try {
        const schemaObj = typeof schema.schema === 'string' ? JSON.parse(schema.schema) : schema.schema;
        if (!schemaObj || Object.keys(schemaObj).length === 0) {
          issues.push({
            type: 'warning',
            message: `状态码 ${schema.status_code} 的响应Schema为空`
          });
        }
      } catch (error) {
        issues.push({
          type: 'error',
          message: `状态码 ${schema.status_code} 的响应Schema解析失败: ${error.message}`
        });
      }
    }

    const mockRules = await db.query(
      'SELECT * FROM mock_rules WHERE api_id = ? AND is_active = 1',
      [api.id]
    );

    if (mockRules.length === 0) {
      issues.push({
        type: 'warning',
        message: '没有配置Mock规则'
      });
    }

    const hasErrors = issues.some(i => i.type === 'error');

    return {
      apiId: api.id,
      apiPath: api.path,
      apiMethod: api.method,
      apiSummary: api.summary,
      valid: !hasErrors,
      issues
    };
  }

  formatErrors(errors) {
    return errors.map(err => {
      const path = err.path || '';
      const message = err.message || '';
      return `${path ? path + ': ' : ''}${message}`;
    }).join('; ');
  }
}

module.exports = new ContractValidator();
