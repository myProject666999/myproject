import fs from 'fs';
import { StatsService } from './api/services/StatsService.js';
import { ArticleService } from './api/services/ArticleService.js';
import { initDatabase } from './api/config/database.js';

async function test() {
  const log = [];
  let allPassed = true;
  
  try {
    initDatabase();
    log.push('✅ Database initialized');

    const statsService = new StatsService();
    const articleService = new ArticleService();
    log.push('✅ Services created');

    log.push('\n=== 测试1: getPopularArticles ===');
    try {
      const popular = await statsService.getPopularArticles(5);
      log.push(`✅ 热门文章: ${JSON.stringify(popular, null, 2)}`);
    } catch (e) {
      log.push(`❌ 热门文章失败: ${e.message}`);
      allPassed = false;
    }

    log.push('\n=== 测试2: getOverview ===');
    try {
      const overview = await statsService.getOverview();
      log.push(`✅ 统计概览: ${JSON.stringify(overview, null, 2)}`);
    } catch (e) {
      log.push(`❌ 统计概览失败: ${e.message}`);
      allPassed = false;
    }

    log.push('\n=== 测试3: getCategoryStats ===');
    try {
      const categoryStats = await statsService.getCategoryStats();
      log.push(`✅ 分类统计: ${JSON.stringify(categoryStats, null, 2)}`);
    } catch (e) {
      log.push(`❌ 分类统计失败: ${e.message}`);
      allPassed = false;
    }

    log.push('\n=== 测试4: getArticleDetail (id=1) ===');
    try {
      const detail = await articleService.getArticleDetail(1);
      if (detail && detail.article) {
        log.push(`✅ 文章详情: 标题="${detail.article.title}", 标签数=${detail.article.tags?.length || 0}`);
      } else {
        log.push('❌ 文章详情失败: 文章不存在');
        allPassed = false;
      }
    } catch (e) {
      log.push(`❌ 文章详情失败: ${e.message}`);
      allPassed = false;
    }

    log.push('\n=== 测试5: updateArticle (id=1) ===');
    try {
      const updateResult = await articleService.updateArticle({
        id: 1,
        title: '测试更新标题 - ' + Date.now(),
        contentMd: '# 测试内容\n\n这是更新后的测试内容。',
        status: 'published',
        tagIds: [1, 2],
      });
      if (updateResult) {
        log.push(`✅ 更新成功: 标题="${updateResult.title}"`);
      } else {
        log.push('❌ 更新失败: 文章不存在');
        allPassed = false;
      }
    } catch (e) {
      log.push(`❌ 更新失败: ${e.message}`);
      log.push('栈: ' + e.stack);
      allPassed = false;
    }

    log.push('\n=== 测试6: incrementViewCount (id=1) ===');
    try {
      await articleService.incrementViewCount(1, '127.0.0.1', 'TestAgent', 'http://localhost');
      log.push('✅ 浏览量增加成功');
    } catch (e) {
      log.push(`❌ 浏览量增加失败: ${e.message}`);
      allPassed = false;
    }

    log.push('\n=== 测试7: getPublishedArticles ===');
    try {
      const list = await articleService.getPublishedArticles({ page: 1, pageSize: 10 });
      log.push(`✅ 文章列表: 总数=${list.total}, 第一页=${list.list.length}篇`);
    } catch (e) {
      log.push(`❌ 文章列表失败: ${e.message}`);
      allPassed = false;
    }

    log.push('\n=== 测试8: getHotArticles ===');
    try {
      const hot = await articleService.getHotArticles(5);
      log.push(`✅ 热门文章列表: ${hot.length}篇`);
    } catch (e) {
      log.push(`❌ 热门文章列表失败: ${e.message}`);
      allPassed = false;
    }

    log.push('\n=== 测试9: getArchive ===');
    try {
      const archive = await articleService.getArchive();
      log.push(`✅ 归档列表: ${archive.length}条`);
    } catch (e) {
      log.push(`❌ 归档列表失败: ${e.message}`);
      allPassed = false;
    }

    log.push('\n=== 测试10: createArticle ===');
    try {
      const newArticle = await articleService.createArticle({
        title: '测试新建文章 - ' + Date.now(),
        summary: '这是测试文章的摘要',
        contentMd: '# 测试新建文章\n\n这是测试内容。',
        status: 'published',
        tagIds: [1],
        categoryId: 1,
      }, 1);
      log.push(`✅ 新建文章成功: id=${newArticle.id}, title="${newArticle.title}"`);
    } catch (e) {
      log.push(`❌ 新建文章失败: ${e.message}`);
      log.push('栈: ' + e.stack);
      allPassed = false;
    }

    log.push('\n' + (allPassed ? '🎉 所有测试通过!' : '❌ 部分测试失败!'));
  } catch (err) {
    log.push('\n❌ 测试过程中发生错误: ' + err.message);
    log.push('栈: ' + err.stack);
    allPassed = false;
  } finally {
    fs.writeFileSync('test-all-result.txt', log.join('\n'));
    console.log(log.join('\n'));
    console.log('\n日志已写入 test-all-result.txt');
    process.exit(allPassed ? 0 : 1);
  }
}

test();
