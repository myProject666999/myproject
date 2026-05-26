import { AppDataSource } from './config/data-source.js';
import { User } from './entities/User.js';
import { Category } from './entities/Category.js';
import { Tag } from './entities/Tag.js';
import { Article } from './entities/Article.js';
import bcrypt from 'bcryptjs';
import { markdownToHtml } from './utils/markdown.js';

async function initDatabase() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userRepo = AppDataSource.getRepository(User);
  const existingUser = await userRepo.findOneBy({ username: 'admin' });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepo.create({
      username: 'admin',
      passwordHash: hashedPassword,
      nickname: '博主',
    });
    await userRepo.save(admin);
    console.log('Default admin user created: admin/admin123');
  }

  const categoryRepo = AppDataSource.getRepository(Category);
  const existingCategories = await categoryRepo.count();
  const categories: Category[] = [];

  if (existingCategories === 0) {
    const defaultCategories = [
      { name: '技术', slug: 'tech', description: '技术相关文章' },
      { name: '生活', slug: 'life', description: '生活随笔' },
      { name: '教程', slug: 'tutorial', description: '编程教程' },
    ];

    for (const cat of defaultCategories) {
      const category = categoryRepo.create(cat);
      const saved = await categoryRepo.save(category);
      categories.push(saved);
    }
    console.log('Default categories created');
  }

  const tagRepo = AppDataSource.getRepository(Tag);
  const existingTags = await tagRepo.count();
  const tags: Tag[] = [];

  if (existingTags === 0) {
    const defaultTags = [
      { name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
      { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
      { name: 'Vue', slug: 'vue', color: '#42b883' },
      { name: 'React', slug: 'react', color: '#61dafb' },
      { name: 'Node.js', slug: 'nodejs', color: '#339933' },
      { name: 'Python', slug: 'python', color: '#3776ab' },
      { name: '数据库', slug: 'database', color: '#003b57' },
      { name: '算法', slug: 'algorithm', color: '#ef4444' },
    ];

    for (const t of defaultTags) {
      const tag = tagRepo.create(t);
      const saved = await tagRepo.save(tag);
      tags.push(saved);
    }
    console.log('Default tags created');
  }

  const articleRepo = AppDataSource.getRepository(Article);
  const existingArticles = await articleRepo.count();

  if (existingArticles === 0) {
    const sampleContent = `# 欢迎使用个人博客系统

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

## 列表

1. 第一项
2. 第二项
3. 第三项

感谢使用本系统！`;

    const sampleArticles = [
      {
        title: '欢迎来到个人博客',
        summary: '这是个人博客系统的第一篇文章，介绍系统的主要功能和使用方法。',
        contentMd: sampleContent,
        categoryId: categories[0]?.id || 1,
        tagIds: tags.length > 0 ? [tags[0].id, tags[2].id] : [1, 2],
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
        categoryId: categories[2]?.id || 3,
        tagIds: tags.length > 0 ? [tags[1].id, tags[0].id] : [1, 2],
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
        categoryId: categories[2]?.id || 3,
        tagIds: tags.length > 0 ? [tags[2].id, tags[1].id] : [1, 2],
      },
    ];

    const user = await userRepo.findOneBy({ username: 'admin' });
    const allTags = await tagRepo.find();

    for (const articleData of sampleArticles) {
      const contentHtml = markdownToHtml(articleData.contentMd);
      const article = articleRepo.create({
        title: articleData.title,
        summary: articleData.summary,
        contentMd: articleData.contentMd,
        contentHtml,
        categoryId: articleData.categoryId,
        userId: user?.id,
        status: 'published',
        publishedAt: new Date(),
        tags: allTags.filter((t) => articleData.tagIds.includes(t.id)),
      });
      await articleRepo.save(article);
    }

    await categoryRepo.increment({}, 'articleCount', 0);
    const allCategories = await categoryRepo.find();
    for (const cat of allCategories) {
      const count = await articleRepo.countBy({ categoryId: cat.id, status: 'published' });
      cat.articleCount = count;
      await categoryRepo.save(cat);
    }

    for (const tag of allTags) {
      const count = await articleRepo
        .createQueryBuilder('article')
        .innerJoin('article.tags', 'tag', 'tag.id = :tagId', { tagId: tag.id })
        .where('article.status = :status', { status: 'published' })
        .getCount();
      tag.articleCount = count;
      await tagRepo.save(tag);
    }

    console.log('Sample articles created');
  }

  console.log('Database initialization complete');
}

export { initDatabase };
