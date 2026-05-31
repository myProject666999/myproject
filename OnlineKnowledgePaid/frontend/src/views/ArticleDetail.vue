<template>
  <div class="article-detail">
    <div v-loading="loading" class="article-detail__main">
      <template v-if="article">
        <header class="article-detail__header">
          <h1 class="article-detail__title">{{ article.title }}</h1>

          <div class="article-detail__meta">
            <div class="article-detail__author">
              <el-avatar :size="32" :src="article.author?.avatar">
                {{ (article.author?.username || 'A').charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="article-detail__author-name">
                {{ article.author?.username || '未知作者' }}
              </span>
            </div>
            <span class="article-detail__time">{{ formatTime(article.created_at) }}</span>
            <span class="article-detail__stat">
              <el-icon><View /></el-icon>
              {{ article.view_count || 0 }}
            </span>
            <span class="article-detail__stat">
              <el-icon><Star /></el-icon>
              {{ likeCount }}
            </span>
            <el-tag
              v-if="article.is_free"
              type="success"
              size="small"
              effect="plain"
            >
              免费
            </el-tag>
          </div>
        </header>

        <div v-if="showPaywall" class="article-detail__paywall-wrapper">
          <Paywall
            :trial-content="article.trial_content"
            :column-id="article.column_id"
            :price="article.column?.price || 0"
            :column-title="article.column?.title || ''"
            @subscribe="handleSubscribe"
          />
        </div>

        <div
          v-else
          class="article-detail__content markdown-body"
          v-html="renderedContent"
        ></div>

        <div class="article-detail__like">
          <el-button
            v-if="userStore.isLoggedIn"
            :type="isLiked ? 'danger' : 'default'"
            size="large"
            round
            @click="handleToggleLike"
          >
            <el-icon><Star /></el-icon>
            <span>{{ isLiked ? '已点赞' : '点赞' }} ({{ likeCount }})</span>
          </el-button>
          <el-button
            v-else
            size="large"
            round
            @click="goLogin"
          >
            <el-icon><Star /></el-icon>
            <span>点赞 ({{ likeCount }})</span>
          </el-button>
        </div>

        <CommentSection :article-id="article.id" />
      </template>

      <el-empty v-if="!loading && !article" description="文章不存在或已被删除" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, View } from '@element-plus/icons-vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { articleApi, likeApi, subscriptionApi } from '../api'
import { useUserStore } from '../stores/user'
import Paywall from '../components/Paywall.vue'
import CommentSection from '../components/CommentSection.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const articleId = computed(() => Number(route.params.id))

const article = ref(null)
const loading = ref(false)
const isLiked = ref(false)
const likeCount = ref(0)
const isSubscribed = ref(false)

marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (e) {}
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

const showPaywall = computed(() => {
  if (!article.value) return false
  if (article.value.is_free) return false
  if (article.value.column?.is_free) return false
  if (isSubscribed.value) return false
  return true
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return marked(article.value.content)
})

async function loadArticle() {
  loading.value = true
  try {
    const data = await articleApi.getById(articleId.value)
    article.value = data
    likeCount.value = data.like_count || 0

    if (userStore.isLoggedIn) {
      try {
        const likeData = await likeApi.check(articleId.value)
        isLiked.value = !!likeData?.is_liked
      } catch {
        isLiked.value = false
      }

      if (data.column_id) {
        try {
          const subData = await subscriptionApi.check(data.column_id)
          isSubscribed.value = !!subData?.is_subscribed || !!subData?.subscribed
        } catch {
          isSubscribed.value = false
        }
      }
    }
  } catch (e) {
    console.error(e)
    article.value = null
  } finally {
    loading.value = false
  }
}

async function handleToggleLike() {
  try {
    const data = await likeApi.toggle({
      article_id: articleId.value
    })
    isLiked.value = !!data?.is_liked
    likeCount.value = data?.like_count ?? likeCount.value + (isLiked.value ? 1 : -1)
    if (likeCount.value < 0) likeCount.value = 0
  } catch (e) {
    console.error(e)
  }
}

function handleSubscribe(columnId) {
  router.push(`/subscribe/${columnId}`)
}

function goLogin() {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
.article-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.article-detail__main {
  min-height: 400px;
}

.article-detail__header {
  margin-bottom: 24px;
}

.article-detail__title {
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}

.article-detail__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  flex-wrap: wrap;
}

.article-detail__author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-detail__author-name {
  color: var(--el-text-color-regular);
}

.article-detail__time {
  color: var(--el-text-color-secondary);
}

.article-detail__stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-detail__paywall-wrapper {
  margin-top: 8px;
}

.article-detail__content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}

.article-detail__like {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.markdown-body :deep(img) {
  max-width: 100%;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.3;
}

.markdown-body :deep(p) {
  margin: 1em 0;
}

.markdown-body :deep(code) {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: 0.9em;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--el-border-color);
  padding-left: 16px;
  margin: 1em 0;
  color: var(--el-text-color-secondary);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2em;
}

.markdown-body :deep(li) {
  margin: 0.5em 0;
}

.markdown-body :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--el-border-color);
  margin: 2em 0;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
}

.markdown-body :deep(th) {
  background: var(--el-fill-color-light);
  font-weight: 600;
}
</style>
