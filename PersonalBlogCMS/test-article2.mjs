import fs from 'fs';
import { ArticleService } from './api/services/ArticleService.js';
import { initDatabase } from './api/config/database.js';

async function test() {
  const log = [];
  try {
    initDatabase();
    log.push('Database initialized');

    const articleService = new ArticleService();
    log.push('ArticleService created');

    log.push('\n=== Testing getArticleDetail (id=1) ===');
    const detail = await articleService.getArticleDetail(1);
    log.push('Article detail: ' + JSON.stringify(detail, null, 2));

    log.push('\n=== Testing updateArticle (id=1) ===');
    try {
      const updateResult = await articleService.updateArticle({
        id: 1,
        title: '测试更新标题 - ' + Date.now(),
        contentMd: '# 测试内容\n\n这是更新后的测试内容。',
        status: 'published',
        tagIds: [1, 2],
      });
      log.push('Update result: ' + JSON.stringify(updateResult, null, 2));
    } catch (err) {
      log.push('Update ERROR: ' + err.message);
      log.push('Update Stack: ' + err.stack);
      throw err;
    }

    log.push('\n=== ALL TESTS PASSED ===');
  } catch (err) {
    log.push('\nFINAL ERROR: ' + err.message);
    log.push('FINAL Stack: ' + err.stack);
  } finally {
    fs.writeFileSync('test-article-full.txt', log.join('\n'));
    console.log('Log written to test-article-full.txt');
  }
}

test();
