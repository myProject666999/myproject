import { StatsService } from './api/services/StatsService.js';
import { initDatabase } from './api/config/database.js';

async function test() {
  try {
    initDatabase();
    console.log('Database initialized');

    const statsService = new StatsService();
    console.log('StatsService created');

    console.log('\n=== Testing getPopularArticles ===');
    const popular = await statsService.getPopularArticles(5);
    console.log('Popular articles:', JSON.stringify(popular, null, 2));

    console.log('\n=== Testing getOverview ===');
    const overview = await statsService.getOverview();
    console.log('Overview:', JSON.stringify(overview, null, 2));

    console.log('\n=== Testing getCategoryStats ===');
    const categoryStats = await statsService.getCategoryStats();
    console.log('Category stats:', JSON.stringify(categoryStats, null, 2));

    console.log('\n=== ALL TESTS PASSED ===');
  } catch (err) {
    console.error('ERROR:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

test();
