<template>
  <div class="category-page">
    <div v-loading="loading" class="article-list">
      <div class="page-header" v-if="category">
        <h1 class="page-title">分类: {{ category.name }}</h1>
        <p v-if="category.description" class="page-desc">{{ category.description }}</p>
      </div>

      <article v-for="article in articles" :key="article.id" class="article-card">
        <h2 class="article-title">
          <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
        </h2>
        <div class="article-meta">
          <span>{{ formatDate(article.publishedAt || article.createdAt) }}</span>
          <span>{{ article.viewCount }} 阅读</span>
        </div>
        <p class="article-summary">{{ article.summary }}</p>
      </article>

      <el-empty v-if="!loading && articles.length === 0" description="该分类下暂无文章" />
    </div>

    <div class="pagination-wrapper" v-if="totalPages > 1">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadArticles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { articleApi } from '../../api/articles';
import { categoryApi } from '../../api/categories';
import type { Article, Category } from '../../../shared/types';

const route = useRoute();
const articles = ref<Article[]>([]);
const category = ref<Category | null>(null);
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

async function loadCategory() {
  const id = parseInt(route.params.id as string);
  const categories = await categoryApi.getAllCategories();
  category.value = categories.find((c) => c.id === id) || null;
}

async function loadArticles() {
  loading.value = true;
  try {
    const categoryId = parseInt(route.params.id as string);
    const result = await articleApi.getPublished({
      categoryId,
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

onMounted(() => {
  loadCategory();
  loadArticles();
});

watch(
  () => route.params.id,
  () => {
    currentPage.value = 1;
    loadCategory();
    loadArticles();
  }
);
</script>

<style scoped>
.category-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.page-desc {
  margin: 8px 0 0 0;
  color: #64748b;
  font-size: 14px;
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
  font-size: 18px;
  font-weight: 600;
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
  color: #64748b;
  font-size: 13px;
  margin-bottom: 12px;
}

.article-summary {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
}
</style>
