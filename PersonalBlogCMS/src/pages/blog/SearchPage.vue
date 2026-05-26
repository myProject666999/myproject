<template>
  <div class="search-page">
    <div class="search-header">
      <el-input
        v-model="keyword"
        placeholder="搜索文章..."
        size="large"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div v-loading="loading" class="article-list">
      <div v-if="searched && articles.length > 0" class="search-info">
        找到 {{ total }} 篇与 "{{ keyword }}" 相关的文章
      </div>
      <div v-if="searched && articles.length === 0" class="search-info">
        未找到与 "{{ keyword }}" 相关的文章
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { articleApi } from '../../api/articles';
import type { Article } from '../../../shared/types';

const route = useRoute();
const keyword = ref('');
const articles = ref<Article[]>([]);
const loading = ref(false);
const searched = ref(false);
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

async function handleSearch() {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  currentPage.value = 1;
  searched.value = true;
  loadArticles();
}

async function loadArticles() {
  if (!keyword.value.trim()) return;
  loading.value = true;
  try {
    const result = await articleApi.search(keyword.value.trim(), currentPage.value, pageSize);
    articles.value = result.list;
    total.value = result.total;
    totalPages.value = result.totalPages;
  } catch (err: any) {
    ElMessage.error(err.message || '搜索失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const kw = route.query.keyword as string;
  if (kw) {
    keyword.value = kw;
    searched.value = true;
    loadArticles();
  }
});
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-header {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-info {
  background: #fff;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  color: #64748b;
  font-size: 14px;
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
