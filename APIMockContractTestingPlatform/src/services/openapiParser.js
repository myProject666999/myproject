const yaml = require('js-yaml');
const fs = require('fs');
const axios = require('axios');

class OpenAPIParser {
  constructor() {
    this.supportedVersions = ['2.0', '3.0.0', '3.0.1', '3.0.2', '3.0.3', '3.1.0'];
  }

  async parseFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.parse(content);
    } catch (error) {
      throw new Error(`读取文件失败: ${error.message}`);
    }
  }

  async parseFromUrl(url) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      return this.parse(response.data);
    } catch (error) {
      throw new Error(`从URL获取OpenAPI文档失败: ${error.message}`);
    }
  }

  parse(content) {
    let spec;
    try {
      if (typeof content === 'string') {
        try {
          spec = JSON.parse(content);
        } catch (jsonError) {
          try {
            spec = yaml.load(content);
          } catch (yamlError) {
            throw new Error('无法解析内容，不是有效的JSON或YAML格式');
          }
        }
      } else if (typeof content === 'object') {
        spec = content;
      } else {
        throw new Error('不支持的内容类型');
      }
    } catch (error) {
      throw error;
    }

    return this.parseSpec(spec);
  }

  parseSpec(spec) {
    const version = spec.openapi || spec.swagger;
    if (!version || !this.isSupportedVersion(version)) {
      throw new Error(`不支持的OpenAPI版本: ${version}`);
    }

    const isOpenAPI3 = version.startsWith('3.');

    const result = {
      version,
      info: spec.info || {},
      servers: this.parseServers(spec, isOpenAPI3),
      paths: [],
      schemas: this.parseSchemas(spec, isOpenAPI3)
    };

    if (spec.paths) {
      for (const [path, pathItem] of Object.entries(spec.paths)) {
        if (!pathItem || typeof pathItem !== 'object') continue;

        const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
        for (const method of methods) {
          const operation = pathItem[method];
          if (!operation || typeof operation !== 'object') continue;

          try {
            const api = this.parseOperation(path, method.toUpperCase(), operation, pathItem, isOpenAPI3, spec);
            if (api) {
              result.paths.push(api);
            }
          } catch (error) {
            console.warn(`解析 ${method} ${path} 时出错:`, error.message);
          }
        }
      }
    }

    return result;
  }

  isSupportedVersion(version) {
    if (!version) return false;
    return this.supportedVersions.some(v => 
      version === v || version.startsWith(v.split('.').slice(0, 2).join('.'))
    );
  }

  parseServers(spec, isOpenAPI3) {
    if (isOpenAPI3 && spec.servers) {
      return spec.servers.map(server => ({
        url: server.url || '',
        description: server.description || ''
      }));
    }
    if (!isOpenAPI3) {
      const schemes = spec.schemes || ['http'];
      const host = spec.host || 'localhost';
      const basePath = spec.basePath || '/';
      return schemes.map(scheme => ({
        url: `${scheme}://${host}${basePath}`,
        description: ''
      }));
    }
    return [];
  }

  parseSchemas(spec, isOpenAPI3) {
    const schemas = {};
    let schemaDefinitions;

    if (isOpenAPI3) {
      schemaDefinitions = spec.components?.schemas || {};
    } else {
      schemaDefinitions = spec.definitions || {};
    }

    for (const [name, schema] of Object.entries(schemaDefinitions)) {
      schemas[name] = this.normalizeSchema(schema);
    }

    return schemas;
  }

  parseOperation(path, method, operation, pathItem, isOpenAPI3, spec) {
    const parameters = [
      ...(pathItem.parameters || []),
      ...(operation.parameters || [])
    ];

    const requestBody = this.parseRequestBody(operation, isOpenAPI3);

    const responses = this.parseResponses(operation, isOpenAPI3);

    return {
      path,
      method,
      summary: operation.summary || '',
      description: operation.description || '',
      tags: operation.tags || [],
      operationId: operation.operationId || '',
      parameters: parameters.map(p => this.normalizeParameter(p)).filter(Boolean),
      requestBody,
      responses
    };
  }

  normalizeParameter(param) {
    if (!param || typeof param !== 'object') return null;

    if (param.$ref) {
      return {
        name: param.$ref.split('/').pop(),
        in: 'query',
        schema: { type: 'string' },
        required: false
      };
    }

    return {
      name: param.name || '',
      in: param.in || 'query',
      description: param.description || '',
      required: param.required || false,
      schema: this.normalizeSchema(param.schema || param)
    };
  }

  parseRequestBody(operation, isOpenAPI3) {
    if (!isOpenAPI3) {
      const bodyParam = (operation.parameters || []).find(p => p.in === 'body');
      if (bodyParam) {
        return {
          content: {
            'application/json': {
              schema: this.normalizeSchema(bodyParam.schema || bodyParam)
            }
          },
          required: bodyParam.required || false
        };
      }
      return null;
    }

    if (!operation.requestBody) return null;

    const content = {};
    if (operation.requestBody.content) {
      for (const [contentType, mediaType] of Object.entries(operation.requestBody.content)) {
        content[contentType] = {
          schema: this.normalizeSchema(mediaType.schema)
        };
      }
    }

    return {
      content,
      required: operation.requestBody.required || false
    };
  }

  parseResponses(operation, isOpenAPI3) {
    const responses = {};

    if (!operation.responses) return responses;

    for (const [statusCode, response] of Object.entries(operation.responses)) {
      if (!response || typeof response !== 'object') continue;

      const content = {};

      if (isOpenAPI3 && response.content) {
        for (const [contentType, mediaType] of Object.entries(response.content)) {
          content[contentType] = {
            schema: this.normalizeSchema(mediaType.schema)
          };
        }
      } else if (!isOpenAPI3 && response.schema) {
        content['application/json'] = {
          schema: this.normalizeSchema(response.schema)
        };
      }

      responses[statusCode] = {
        description: response.description || '',
        content
      };
    }

    return responses;
  }

  normalizeSchema(schema) {
    if (!schema || typeof schema !== 'object') {
      return { type: 'string' };
    }

    const result = { ...schema };

    if (schema.$ref) {
      result.$ref = schema.$ref;
    }

    if (schema.properties) {
      result.properties = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        result.properties[key] = this.normalizeSchema(prop);
      }
    }

    if (schema.items) {
      result.items = this.normalizeSchema(schema.items);
    }

    if (schema.allOf) {
      result.allOf = schema.allOf.map(s => this.normalizeSchema(s));
    }

    if (schema.oneOf) {
      result.oneOf = schema.oneOf.map(s => this.normalizeSchema(s));
    }

    if (schema.anyOf) {
      result.anyOf = schema.anyOf.map(s => this.normalizeSchema(s));
    }

    return result;
  }
}

module.exports = new OpenAPIParser();
