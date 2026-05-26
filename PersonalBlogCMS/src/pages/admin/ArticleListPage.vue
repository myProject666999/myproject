<template>
  <div class="article-list-page">
    <div class="page-header">
      <h2 class="page-title">文章管理</h2>
      <el-button type="primary" @click="goCreate">
        <el-icon><Plus /></el-icon>
        新建文章
      </el-button>
    </div>

    <el-card shadow="hover">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索文章标题"
          clearable
          style="width: 240px"
          @clear="loadArticles"
          @keyup.enter="loadArticles"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 140px" @change="loadArticles">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
        </el-select>
      </div>

      <el-table v-loading="loading" :data="articles" stripe style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="250">
          <template #default="{ row }">
            <router-link :to="`/article/${row.id}`" class="article-link">{{ row.title }}</router-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" effect="light">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120" align="center">
          <template #default="{ row }">
            {{ row.category?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="阅读量" width="100" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="goEdit(row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadArticles"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { articleApi } from '../../api/articles';
import type { Article, ArticleStatus } from '../../../shared/types';

const router = useRouter();
const articles = ref<Article[]>([]);
const loading = ref(false);
const keyword = ref('');
const statusFilter = ref<ArticleStatus | ''>('');
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);

function formatDate(date: Date | string) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

async function loadArticles() {
  loading.value = true;
  try {
    const result = await articleApi.getAll({
      page: currentPage.value,
      pageSize,
      keyword: keyword.value.trim() || undefined,
      status: statusFilter.value || undefined,
    });
    articles.value = result.list;
    total.value = result.total;
  } catch (err: any) {
    ElMessage.error(err.message || '加载文章失败');
  } finally {
    loading.value = false;
  }
}

function goCreate() {
  router.push('/admin/articles/create');
}

function goEdit(id: number) {
  router.push(`/admin/articles/edit/${id}`);
}

async function handleDelete(row: Article) {
  try {
    await ElMessageBox.confirm(`确定删除文章 "${row.title}" 吗？`, '提示', {
      type: 'warning',
    });
    await articleApi.delete(row.id);
    ElMessage.success('删除成功');
    loadArticles();
  } catch (_) {
    /* cancelled */
  }
}

onMounted(loadArticles);
</script>

<style scoped>
.article-list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.article-link {
  color: #1e293b;
  text-decoration: none;
  font-weight: 500;
}

.article-link:hover {
  color: #10b981;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
