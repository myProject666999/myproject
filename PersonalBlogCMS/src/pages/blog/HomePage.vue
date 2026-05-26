<template>
  <div class="home-page">
    <div v-loading="loading" class="article-list">
      <article v-for="article in articles" :key="article.id" class="article-card">
        <h2 class="article-title">
          <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
        </h2>
        <div class="article-meta">
          <span v-if="article.category" class="meta-item">
            <el-icon><Folder /></el-icon>
            <router-link :to="`/category/${article.category.id}`">{{ article.category.name }}</router-link>
          </span>
          <span class="meta-item">
            <el-icon><Calendar /></el-icon>
            {{ formatDate(article.publishedAt || article.createdAt) }}
          </span>
          <span class="meta-item">
            <el-icon><View /></el-icon>
            {{ article.viewCount }} 阅读
          </span>
        </div>
        <p class="article-summary">{{ article.summary }}</p>
        <div class="article-tags" v-if="article.tags && article.tags.length > 0">
          <el-tag
            v-for="tag in article.tags"
            :key="tag.id"
            :color="tag.color + '20'"
            :style="{ color: tag.color, borderColor: tag.color + '40' }"
            size="small"
          >
            #{{ tag.name }}
          </el-tag>
        </div>
      </article>

      <el-empty v-if="!loading && articles.length === 0" description="暂无文章" />
    </div>

    <div class="pagination-wrapper" v-if="totalPages > 1">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { articleApi } from '../../api/articles';
import type { Article } from '../../../shared/types';

const route = useRoute();
const router = useRouter();

const articles = ref<Article[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);
const totalPages = ref(0);

function formatDate(date: Date | string) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function loadArticles() {
  loading.value = true;
  try {
    const result = await articleApi.getPublished({
      page: currentPage.value,
      pageSize,
    });
    articles.value = result.list;
    total.value = result.total;
    totalPages.value = result.totalPages;
  } catch (err: any) {
    ElMessage.error(err.message || '加载文章失败');
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadArticles();
  router.push({ path: '/', query: { page } });
}

onMounted(() => {
  const p = parseInt(route.query.page as string) || 1;
  currentPage.value = p;
  loadArticles();
});
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.article-title a {
  color: #1e293b;
  text-decoration: none;
  transition: color 0.2s;
}

.article-title a:hover {
  color: #10b981;
}

.article-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 12px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-item a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.meta-item a:hover {
  color: #10b981;
}

.article-summary {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>
