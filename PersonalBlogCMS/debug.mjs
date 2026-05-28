process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

import { ArticleService } from './api/services/ArticleService.js';

async function test() {
  console.log('Starting debug test...');
  try {
    const service = new ArticleService();
    console.log('ArticleService created');

    console.log('Testing updateArticle with id=1...');
    const result = await service.updateArticle({
      id: 1,
      title: '测试更新标题 DEBUG',
      contentMd: '# 测试内容\n\n这是测试内容。',
      status: 'published',
      tagIds: [1, 2],
    });

    console.log('Update result:', JSON.stringify(result, null, 2));
    console.log('SUCCESS!');
  } catch (err) {
    console.error('ERROR:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

test();
