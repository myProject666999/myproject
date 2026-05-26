<template>
  <div class="blog-layout">
    <header class="header">
      <div class="container header-inner">
        <router-link to="/" class="logo">
          <span class="logo-text">个人博客</span>
        </router-link>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/archive" class="nav-link">归档</router-link>
          <router-link to="/about" class="nav-link">关于</router-link>
          <router-link to="/login" class="nav-link admin-link">管理</router-link>
        </nav>
      </div>
    </header>

    <div class="container main-wrapper">
      <main class="main-content">
        <router-view />
      </main>

      <aside class="sidebar" v-if="!isArticlePage">
        <div class="sidebar-card">
          <h3 class="sidebar-title">热门文章</h3>
          <el-scrollbar max-height="300px">
            <ul class="hot-list">
              <li v-for="article in hotArticles" :key="article.id">
                <router-link :to="`/article/${article.id}`" class="hot-link">
                  {{ article.title }}
                  <span class="hot-count">{{ article.viewCount }} 阅读</span>
                </router-link>
              </li>
              <li v-if="hotArticles.length === 0" class="empty">暂无数据</li>
            </ul>
          </el-scrollbar>
        </div>

        <div class="sidebar-card">
          <h3 class="sidebar-title">分类</h3>
          <ul class="category-list">
            <li v-for="cat in categories" :key="cat.id">
              <router-link :to="`/category/${cat.id}`" class="category-link">
                {{ cat.name }}
                <span class="category-count">{{ cat.articleCount }}</span>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="sidebar-card">
          <h3 class="sidebar-title">标签云</h3>
          <div class="tag-cloud">
            <router-link
              v-for="tag in tags"
              :key="tag.id"
              :to="`/search?tagId=${tag.id}`"
              class="tag-item"
              :style="{ color: tag.color }"
            >
              #{{ tag.name }}
            </router-link>
          </div>
        </div>
      </aside>
    </div>

    <footer class="footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} 个人博客. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { articleApi } from '../api/articles';
import { categoryApi } from '../api/categories';
import type { Article, Category, Tag } from '../../shared/types';

const route = useRoute();
const hotArticles = ref<Article[]>([]);
const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

const isArticlePage = computed(() => route.path.startsWith('/article/'));

onMounted(async () => {
  try {
    hotArticles.value = await articleApi.getHot(8);
  } catch (_) { /* ignore */ }
  try {
    categories.value = await categoryApi.getAllCategories();
  } catch (_) { /* ignore */ }
  try {
    tags.value = await categoryApi.getAllTags();
  } catch (_) { /* ignore */ }
});
</script>

<style scoped>
.blog-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #1e3a5f;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.logo-text {
  background: linear-gradient(135deg, #10b981, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #10b981;
}

.admin-link {
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-size: 12px;
}

.main-wrapper {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px 20px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 12px;
  border-bottom: 2px solid #10b981;
  display: inline-block;
}

.hot-list,
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hot-list li,
.category-list li {
  padding: 8px 0;
}

.hot-link,
.category-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #475569;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.hot-link:hover,
.category-link:hover {
  color: #10b981;
}

.hot-count,
.category-count {
  color: #94a3b8;
  font-size: 12px;
}

.empty {
  color: #94a3b8;
  text-align: center;
  padding: 16px 0;
  font-size: 14px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  font-size: 13px;
  text-decoration: none;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.tag-item:hover {
  background: #f1f5f9;
}

.footer {
  background: #1e293b;
  color: #94a3b8;
  padding: 24px 0;
  text-align: center;
  font-size: 14px;
}

@media (max-width: 768px) {
  .main-wrapper {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}
</style>
