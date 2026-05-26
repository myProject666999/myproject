import 'reflect-metadata';
import app from './app.js';
import { initDatabase } from './config/database.js';
import { config } from './config/index.js';
import bcrypt from 'bcryptjs';
import { db } from './config/database.js';

async function seedInitialData(): Promise<void> {
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingUser) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)').run(
      'admin',
      hashedPassword,
      '博主'
    );
    console.log('Default admin user created: admin/admin123');
  }

  const categoryCount = (db.prepare('SELECT COUNT(*) as cnt FROM categories').get() as { cnt: number }).cnt;
  if (categoryCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
    insertCat.run('技术', 'tech', '技术相关文章');
    insertCat.run('生活', 'life', '生活随笔');
    insertCat.run('教程', 'tutorial', '编程教程');
    console.log('Default categories created');
  }

  const tagCount = (db.prepare('SELECT COUNT(*) as cnt FROM tags').get() as { cnt: number }).cnt;
  if (tagCount === 0) {
    const insertTag = db.prepare('INSERT INTO tags (name, slug, color) VALUES (?, ?, ?)');
    insertTag.run('JavaScript', 'javascript', '#f7df1e');
    insertTag.run('TypeScript', 'typescript', '#3178c6');
    insertTag.run('Vue', 'vue', '#42b883');
    insertTag.run('React', 'react', '#61dafb');
    insertTag.run('Node.js', 'nodejs', '#339933');
    insertTag.run('Python', 'python', '#3776ab');
    insertTag.run('数据库', 'database', '#003b57');
    insertTag.run('算法', 'algorithm', '#ef4444');
    console.log('Default tags created');
  }

  const articleCount = (db.prepare('SELECT COUNT(*) as cnt FROM articles').get() as { cnt: number }).cnt;
  if (articleCount === 0) {
    const { marked } = await import('marked');
    const insertArticle = db.prepare(
      'INSERT INTO articles (title, summary, content_md, content_html, category_id, user_id, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const insertArticleTag = db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)');

    const user = db.prepare('SELECT id FROM users WHERE username = ?').get('admin') as { id: number };
    const tags = db.prepare('SELECT id, slug FROM tags').all() as { id: number; slug: string }[];

    const sampleArticles = [
      {
        title: '欢迎来到个人博客',
        summary: '这是个人博客系统的第一篇文章，介绍系统的主要功能和使用方法。',
        contentMd: `# 欢迎使用个人博客系统

这是一篇示例文章，用于演示博客系统的功能。

## 功能特性

- **Markdown 编辑**: 支持完整的 Markdown 语法
- **代码高亮**: 支持多种编程语言的语法高亮
- **分类标签**: 文章可以归类和打标签
- **评论系统**: 访客可以发表评论

## 代码示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}

hello('World');
\`\`\`

## 引用

> 这是一段引用文字

感谢使用本系统！`,
        categorySlug: 'tech',
        tagSlugs: ['javascript', 'vue'],
      },
      {
        title: 'TypeScript 入门指南',
        summary: '从零开始学习 TypeScript，了解类型系统的基本概念和最佳实践。',
        contentMd: `# TypeScript 入门指南

TypeScript 是 JavaScript 的超集，添加了可选的静态类型和基于类的面向对象编程。

## 为什么使用 TypeScript？

1. **类型安全**: 在编译时捕获错误
2. **更好的 IDE 支持**: 智能提示、自动补全
3. **代码可读性**: 类型即文档

## 基础类型

\`\`\`typescript
let name: string = 'TypeScript';
let age: number = 10;
let isActive: boolean = true;
\`\`\``,
        categorySlug: 'tutorial',
        tagSlugs: ['typescript', 'javascript'],
      },
      {
        title: 'Vue 3 组合式 API 详解',
        summary: '深入理解 Vue 3 的组合式 API，学习如何构建可复用的逻辑。',
        contentMd: `# Vue 3 组合式 API 详解

Vue 3 引入了组合式 API，这是一种全新的组织组件逻辑的方式。

## setup 函数

\`\`\`vue
<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

const count = ref(0);
const state = reactive({ name: 'Vue 3' });

const doubled = computed(() => count.value * 2);

function increment() {
  count.value++;
}
</script>
\`\`\``,
        categorySlug: 'tutorial',
        tagSlugs: ['vue', 'typescript'],
      },
    ];

    for (const article of sampleArticles) {
      const category = db.prepare('SELECT id FROM categories WHERE slug = ?').get(article.categorySlug) as { id: number } | undefined;
      const contentHtml = marked.parse(article.contentMd) as string;

      const result = insertArticle.run(
        article.title,
        article.summary,
        article.contentMd,
        contentHtml,
        category?.id,
        user.id,
        'published',
        new Date().toISOString()
      );
      const articleId = result.lastInsertRowid as number;

      for (const tagSlug of article.tagSlugs) {
        const tag = tags.find((t) => t.slug === tagSlug);
        if (tag) {
          insertArticleTag.run(articleId, tag.id);
        }
      }
    }

    const updateCatCount = db.prepare('UPDATE categories SET article_count = (SELECT COUNT(*) FROM articles WHERE category_id = categories.id AND status = ?), updated_at = CURRENT_TIMESTAMP');
    updateCatCount.run('published');

    const updateTagCount = db.prepare(
      'UPDATE tags SET article_count = (SELECT COUNT(*) FROM article_tags at JOIN articles a ON a.id = at.article_id WHERE at.tag_id = tags.id AND a.status = ?), updated_at = CURRENT_TIMESTAMP'
    );
    updateTagCount.run('published');

    console.log('Sample articles created');
  }
}

async function startServer() {
  try {
    initDatabase();
    console.log('Database initialized');

    await seedInitialData();
    console.log('Initial data seeded');

    const server = app.listen(config.port, () => {
      console.log(`Server ready on port ${config.port}`);
      console.log(`API: http://localhost:${config.port}/api`);
      console.log(`Health: http://localhost:${config.port}/api/health`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
