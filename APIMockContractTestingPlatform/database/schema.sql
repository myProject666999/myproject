CREATE DATABASE IF NOT EXISTS api_mock_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE api_mock_platform;

DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS contract_reports;
DROP TABLE IF EXISTS contract_tests;
DROP TABLE IF EXISTS mock_rules;
DROP TABLE IF EXISTS mock_scenarios;
DROP TABLE IF EXISTS api_schemas;
DROP TABLE IF EXISTS apis;
DROP TABLE IF EXISTS environments;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    status TINYINT DEFAULT 1 COMMENT '1: active, 0: inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) DEFAULT 'member' COMMENT 'owner, admin, member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_user (team_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_url VARCHAR(255),
    openapi_spec TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE environments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(50) NOT NULL COMMENT 'dev, test, staging, prod',
    base_url VARCHAR(255),
    variables TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_env (project_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE apis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL COMMENT 'GET, POST, PUT, DELETE, PATCH',
    summary VARCHAR(255),
    description TEXT,
    tags VARCHAR(255),
    operation_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_api (project_id, path, method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE api_schemas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_id INT NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'request, response',
    content_type VARCHAR(100) DEFAULT 'application/json',
    status_code VARCHAR(10),
    schema_def TEXT,
    examples TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mock_scenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mock_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_id INT NOT NULL,
    scenario_id INT,
    name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(20) NOT NULL COMMENT 'random, template, conditional',
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    conditions TEXT COMMENT '条件规则的匹配条件',
    response_template TEXT COMMENT '响应模板',
    response_status INT DEFAULT 200,
    response_headers TEXT,
    delay_ms INT DEFAULT 0 COMMENT '响应延迟毫秒',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE CASCADE,
    FOREIGN KEY (scenario_id) REFERENCES mock_scenarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contract_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    test_config TEXT COMMENT '测试配置：包括要校验的API列表、环境等',
    last_run_at TIMESTAMP NULL,
    last_status VARCHAR(20) COMMENT 'passed, failed, pending',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contract_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    environment_id INT,
    status VARCHAR(20) NOT NULL COMMENT 'passed, failed',
    summary TEXT COMMENT '统计摘要：总数、通过数、失败数',
    details TEXT COMMENT '详细的校验结果',
    duration_ms INT,
    executed_by INT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES contract_tests(id) ON DELETE CASCADE,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE SET NULL,
    FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE access_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    api_id INT,
    scenario_id INT,
    environment_id INT,
    request_method VARCHAR(10) NOT NULL,
    request_path VARCHAR(1000) NOT NULL,
    request_headers TEXT,
    request_body TEXT,
    response_status INT,
    response_headers TEXT,
    response_body TEXT,
    response_time_ms INT,
    client_ip VARCHAR(50),
    user_agent VARCHAR(500),
    matched_rule_id INT,
    is_from_cache BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_time (project_id, created_at),
    INDEX idx_api_time (api_id, created_at),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (api_id) REFERENCES apis(id) ON DELETE SET NULL,
    FOREIGN KEY (scenario_id) REFERENCES mock_scenarios(id) ON DELETE SET NULL,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, email, password_hash) VALUES 
('admin', 'admin@example.com', '$2a$10$5NLb1xjdx.a2xc1irc.thOPWPb/T65HSSC2viOr1rsi1LdYW0fKOG');

INSERT INTO teams (name, description, created_by) VALUES 
('默认团队', '系统默认团队', 1);

INSERT INTO team_members (team_id, user_id, role) VALUES 
(1, 1, 'owner');

INSERT INTO projects (team_id, name, description, base_url, created_by) VALUES 
(1, '示例项目', '这是一个示例项目，用于演示平台功能', '/api/v1', 1);

INSERT INTO environments (project_id, name, base_url, is_default) VALUES 
(1, 'dev', 'http://localhost:3000', TRUE),
(1, 'test', 'http://test.example.com', FALSE),
(1, 'staging', 'http://staging.example.com', FALSE);

INSERT INTO mock_scenarios (project_id, name, description, is_default, is_active, created_by) VALUES 
(1, '默认场景', '默认Mock场景，返回标准响应数据', TRUE, TRUE, 1),
(1, '异常场景', '模拟各种异常情况：超时、错误响应等', FALSE, FALSE, 1),
(1, '大数据场景', '返回大量数据用于测试性能', FALSE, FALSE, 1);

INSERT INTO apis (project_id, path, method, summary, description, tags, operation_id) VALUES 
(1, '/users', 'GET', '获取用户列表', '获取所有用户的列表信息', '用户管理', 'getUsers'),
(1, '/users', 'POST', '创建用户', '创建一个新用户', '用户管理', 'createUser'),
(1, '/users/{id}', 'GET', '获取用户详情', '根据用户ID获取用户详细信息', '用户管理', 'getUserById'),
(1, '/users/{id}', 'PUT', '更新用户', '更新指定用户的信息', '用户管理', 'updateUser'),
(1, '/users/{id}', 'DELETE', '删除用户', '删除指定的用户', '用户管理', 'deleteUser'),
(1, '/orders', 'GET', '获取订单列表', '获取订单列表，支持分页和筛选', '订单管理', 'getOrders'),
(1, '/orders/{id}', 'GET', '获取订单详情', '获取单个订单的详细信息', '订单管理', 'getOrderById');

INSERT INTO api_schemas (api_id, type, content_type, status_code, schema_def) VALUES 
(1, 'response', 'application/json', '200', '{"type":"array","items":{"type":"object","properties":{"id":{"type":"integer"},"name":{"type":"string"},"email":{"type":"string"},"status":{"type":"string"}}}}'),
(2, 'request', 'application/json', NULL, '{"type":"object","required":["name","email"],"properties":{"name":{"type":"string","minLength":2},"email":{"type":"string","format":"email"},"phone":{"type":"string"}}}}'),
(2, 'response', 'application/json', '201', '{"type":"object","properties":{"id":{"type":"integer"},"name":{"type":"string"},"email":{"type":"string"},"created_at":{"type":"string","format":"date-time"}}}}'),
(3, 'response', 'application/json', '200', '{"type":"object","properties":{"id":{"type":"integer"},"name":{"type":"string"},"email":{"type":"string"},"phone":{"type":"string"},"status":{"type":"string"},"created_at":{"type":"string","format":"date-time"}}}}');

INSERT INTO mock_rules (api_id, scenario_id, name, rule_type, priority, response_template, response_status, delay_ms) VALUES 
(1, 1, '默认用户列表', 'template', 0, '[{"id":1,"name":"张三","email":"zhangsan@example.com","status":"active"},{"id":2,"name":"李四","email":"lisi@example.com","status":"active"},{"id":3,"name":"王五","email":"wangwu@example.com","status":"inactive"}]', 200, 0),
(2, 1, '创建用户成功', 'template', 0, '{"id":100,"name":"${request.body.name}","email":"${request.body.email}","created_at":"{{now}}"}', 201, 50),
(3, 1, '获取用户详情', 'random', 0, '{"id":"${request.params.id}","name":"{{name.findName}}","email":"{{internet.email}}","phone":"{{phone.phoneNumber}}","status":"{{random.arrayElement [\"active\",\"inactive\"]}}","created_at":"{{date.past}}"}', 200, 100),
(3, 2, '用户不存在', 'template', 1, '{"error":"User not found","code":404,"message":"用户不存在"}', 404, 0);
