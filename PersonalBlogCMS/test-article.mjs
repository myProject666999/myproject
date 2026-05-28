import { ArticleService } from './api/services/ArticleService.js';
import { initDatabase } from './api/config/database.js';

async function test() {
  try {
    initDatabase();
    console.log('Database initialized');

    const articleService = new ArticleService();
    console.log('ArticleService created');

    console.log('\n=== Testing getArticleDetail (id=1) ===');
    const detail = await articleService.getArticleDetail(1);
    console.log('Article detail:', JSON.stringify(detail, null, 2));

    console.log('\n=== Testing updateArticle (id=1) ===');
    const updateResult = await articleService.updateArticle({
      id: 1,
      title: '测试更新标题 - ' + Date.now(),
      contentMd: '# 测试内容\n\n这是更新后的测试内容。',
      status: 'published',
      tagIds: [1, 2],
    });
    console.log('Update result:', JSON.stringify(updateResult, null, 2));

    console.log('\n=== Testing getPublishedArticles ===');
    const list = await articleService.getPublishedArticles({ page: 1, pageSize: 10 });
    console.log('Article list total:', list.total);
    console.log('First article title:', list.list[0]?.title);

    console.log('\n=== ALL TESTS PASSED ===');
  } catch (err) {
    console.error('ERROR:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

test();
