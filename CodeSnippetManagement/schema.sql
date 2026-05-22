-- ============================================
-- 代码片段管理系统数据库脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS code_snippet_db 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE code_snippet_db;

-- ============================================
-- 用户表
-- ============================================
DROP TABLE IF EXISTS snippet_tags;
DROP TABLE IF EXISTS snippet_versions;
DROP TABLE IF EXISTS snippets;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 标签表
-- ============================================
CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 代码片段表
-- ============================================
CREATE TABLE snippets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'javascript',
    visibility ENUM('private', 'public') NOT NULL DEFAULT 'public',
    user_id BIGINT UNSIGNED NULL,
    current_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_visibility (visibility),
    INDEX idx_language (language),
    INDEX idx_created_at (created_at),
    INDEX idx_title (title),
    FULLTEXT KEY ft_title_desc (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 代码片段版本表
-- ============================================
CREATE TABLE snippet_versions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    snippet_id BIGINT UNSIGNED NOT NULL,
    version INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    change_note VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_snippet_id (snippet_id),
    INDEX idx_version (snippet_id, version),
    UNIQUE KEY uk_snippet_version (snippet_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 代码片段-标签关联表
-- ============================================
CREATE TABLE snippet_tags (
    snippet_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (snippet_id, tag_id),
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 插入示例数据
-- ============================================

-- 示例用户
INSERT INTO users (username, email, password_hash) VALUES
('demo', 'demo@example.com', '$2b$10$examplehash');

-- 示例标签
INSERT INTO tags (name) VALUES
('javascript'),
('python'),
('react'),
('css'),
('html'),
('nodejs'),
('typescript');

-- 示例代码片段
INSERT INTO snippets (title, description, code, language, visibility, user_id, current_version) VALUES
('JavaScript Debounce 函数', '用于限制函数调用频率的防抖函数', 
'function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}',
'javascript', 'public', 1, 1),

('React useState 示例', 'React Hooks useState 的基本使用方法',
'import { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}',
'jsx', 'public', 1, 1),

('Python 装饰器示例', '一个简单的 Python 装饰器实现',
'def timer(func):
    import time
    
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} ran in {end - start:.2f}s")
        return result
    
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    
slow_function()',
'python', 'public', 1, 1),

('CSS Flexbox 居中', '使用 Flexbox 实现完美居中',
'.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}',
'css', 'public', 1, 1),

('TypeScript 类型工具', '常用的 TypeScript 类型工具示例',
'type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

// 选取部分属性
type UserPreview = Pick<User, ''id'' | ''name''>;

// 排除部分属性
type PublicUser = Omit<User, ''password''>;

// 可选属性
type PartialUser = Partial<User>;

// 必填属性
type RequiredUser = Required<PartialUser>;',
'typescript', 'public', 1, 1),

('Node.js Express 简单服务器', '使用 Express 创建简单的 HTTP 服务器',
'const express = require(''express'');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get(''/'', (req, res) => {
  res.json({ message: ''Hello World!'' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});',
'javascript', 'public', 1, 1),

('HTML5 语义化结构', 'HTML5 语义化标签的使用示例',
'<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>语义化页面</title>
</head>
<body>
  <header>
    <nav>导航菜单</nav>
  </header>
  <main>
    <article>
      <h1>文章标题</h1>
      <p>文章内容...</p>
    </article>
    <aside>侧边栏</aside>
  </main>
  <footer>页脚</footer>
</body>
</html>',
'html', 'public', 1, 1),

('私有测试片段', '这是一个私有的代码片段',
'private secret code here',
'javascript', 'private', 1, 1);

-- 版本历史
INSERT INTO snippet_versions (snippet_id, version, title, description, code, language, change_note) VALUES
(1, 1, 'JavaScript Debounce 函数', '用于限制函数调用频率的防抖函数', 
'function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}',
'javascript', '初始版本'),

(2, 1, 'React useState 示例', 'React Hooks useState 的基本使用方法',
'import { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}',
'jsx', '初始版本'),

(3, 1, 'Python 装饰器示例', '一个简单的 Python 装饰器实现',
'def timer(func):
    import time
    
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} ran in {end - start:.2f}s")
        return result
    
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    
slow_function()',
'python', '初始版本'),

(4, 1, 'CSS Flexbox 居中', '使用 Flexbox 实现完美居中',
'.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}',
'css', '初始版本'),

(5, 1, 'TypeScript 类型工具', '常用的 TypeScript 类型工具示例',
'type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

// 选取部分属性
type UserPreview = Pick<User, ''id'' | ''name''>;

// 排除部分属性
type PublicUser = Omit<User, ''password''>;

// 可选属性
type PartialUser = Partial<User>;

// 必填属性
type RequiredUser = Required<PartialUser>;',
'typescript', '初始版本'),

(6, 1, 'Node.js Express 简单服务器', '使用 Express 创建简单的 HTTP 服务器',
'const express = require(''express'');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get(''/'', (req, res) => {
  res.json({ message: ''Hello World!'' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});',
'javascript', '初始版本'),

(7, 1, 'HTML5 语义化结构', 'HTML5 语义化标签的使用示例',
'<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>语义化页面</title>
</head>
<body>
  <header>
    <nav>导航菜单</nav>
  </header>
  <main>
    <article>
      <h1>文章标题</h1>
      <p>文章内容...</p>
    </article>
    <aside>侧边栏</aside>
  </main>
  <footer>页脚</footer>
</body>
</html>',
'html', '初始版本'),

(8, 1, '私有测试片段', '这是一个私有的代码片段',
'private secret code here',
'javascript', '初始版本');

-- 片段标签关联
INSERT INTO snippet_tags (snippet_id, tag_id) VALUES
(1, 1), (1, 6),
(2, 1), (2, 3),
(3, 2),
(4, 4),
(5, 1), (5, 7),
(6, 1), (6, 6),
(7, 5);
