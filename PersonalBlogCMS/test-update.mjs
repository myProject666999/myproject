import { ArticleService } from './api/services/ArticleService.js';

async function testUpdate() {
  try {
    const articleService = new ArticleService();
    console.log('Testing updateArticle...');
    
    const result = await articleService.updateArticle({
      id: 1,
      title: '测试更新标题',
      contentMd: '# 测试内容',
      status: 'published',
      tagIds: [1, 2],
    });
    
    console.log('Update success:', result);
  } catch (error) {
    console.error('Update failed:', error);
    console.error('Stack:', (error as Error).stack);
  }
}

testUpdate();
