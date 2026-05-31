<template>
  <div class="column-detail">
    <div v-loading="loading" class="column-detail__main">
      <div v-if="column" class="column-detail__header">
        <div class="column-detail__cover-wrapper">
          <el-image
            :src="column.cover_image"
            fit="cover"
            class="column-detail__cover"
          >
            <template #error>
              <div class="column-detail__cover-placeholder">
                <el-icon :size="64"><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <el-tag
            v-if="column.is_free"
            class="column-detail__tag"
            type="success"
            effect="dark"
            size="large"
          >
            免费专栏
          </el-tag>
          <el-tag
            v-else
            class="column-detail__tag"
            type="warning"
            effect="dark"
            size="large"
          >
            付费专栏
          </el-tag>
        </div>

        <div class="column-detail__info">
          <h1 class="column-detail__title">{{ column.title }}</h1>
          <p class="column-detail__desc">{{ column.description }}</p>

          <div class="column-detail__author-card">
            <el-avatar :size="48" :src="column.author?.avatar">
              {{ (column.author?.username || 'A').charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="column-detail__author-info">
              <div class="column-detail__author-name">
                {{ column.author?.username || '未知作者' }}
              </div>
              <div v-if="column.author?.bio" class="column-detail__author-bio">
                {{ column.author.bio }}
              </div>
            </div>
          </div>

          <div class="column-detail__stats">
            <div class="column-detail__stat">
              <span class="column-detail__stat-label">订阅价格</span>
              <span class="column-detail__stat-value column-detail__stat-value--price">
                ¥{{ (column.price || 0).toFixed(2) }}
              </span>
            </div>
            <div class="column-detail__stat">
              <span class="column-detail__stat-label">订阅人数</span>
              <span class="column-detail__stat-value">
                {{ column.subscriber_count || 0 }}
              </span>
            </div>
            <div class="column-detail__stat">
              <span class="column-detail__stat-label">文章数量</span>
              <span class="column-detail__stat-value">
                {{ column.article_count || articles.length }}
              </span>
            </div>
          </div>

          <div class="column-detail__actions">
            <el-tag
              v-if="isSubscribed"
              type="success"
              effect="dark"
              size="large"
            >
              <el-icon><Check /></el-icon>
              已订阅
            </el-tag>
            <template v-else-if="userStore.isLoggedIn && !column.is_free">
              <el-button type="primary" size="large" @click="handleSubscribe">
                <el-icon><Lock /></el-icon>
                订阅专栏 ¥{{ (column.price || 0).toFixed(2) }}
              </el-button>
            </template>
            <template v-else-if="!userStore.isLoggedIn && !column.is_free">
              <el-button type="primary" size="large" @click="goLogin">
                <el-icon><Lock /></el-icon>
                登录后订阅 ¥{{ (column.price || 0).toFixed(2) }}
              </el-button>
            </template>
            <el-tag
              v-if="column.is_free"
              type="success"
              effect="plain"
              size="large"
            >
              免费阅读
            </el-tag>

            <el-button
              v-if="isAuthor"
              type="primary"
              plain
              size="large"
              @click="articleDialogVisible = true"
            >
              <el-icon><Plus /></el-icon>
              添加文章
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && !column" description="专栏不存在或已被删除" />

      <section v-if="column" class="column-detail__articles">
        <h2 class="column-detail__articles-title">专栏文章</h2>

        <div v-loading="articlesLoading" class="column-detail__article-list">
          <el-card
            v-for="article in articles"
            :key="article.id"
            class="column-detail__article-card"
            shadow="hover"
            @click="goArticleDetail(article.id)"
          >
            <div class="column-detail__article-main">
              <h3 class="column-detail__article-title">
                {{ article.title }}
                <el-tag
                  v-if="article.is_free"
                  type="success"
                  size="small"
                  effect="plain"
                  style="margin-left: 8px"
                >
                  免费
                </el-tag>
              </h3>
              <p v-if="article.summary" class="column-detail__article-summary">
                {{ article.summary }}
              </p>
              <div class="column-detail__article-meta">
                <span class="column-detail__article-stat">
                  <el-icon><View /></el-icon>
                  {{ article.view_count || 0 }}
                </span>
                <span class="column-detail__article-stat">
                  <el-icon><Star /></el-icon>
                  {{ article.like_count || 0 }}
                </span>
              </div>
            </div>
          </el-card>

          <el-empty v-if="!articlesLoading && articles.length === 0" description="暂无文章" />
        </div>
      </section>
    </div>

    <el-dialog
      v-model="articleDialogVisible"
      title="添加文章"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="articleFormRef"
        :model="articleFormData"
        :rules="articleFormRules"
        label-width="90px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="articleFormData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="articleFormData.summary"
            type="textarea"
            :rows="2"
            placeholder="请输入文章摘要"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="是否免费">
          <el-switch v-model="articleFormData.is_free" />
        </el-form-item>
        <el-form-item label="试用内容" prop="trial_content">
          <el-input
            v-model="articleFormData.trial_content"
            type="textarea"
            :rows="3"
            placeholder="请输入试用内容（可选）"
          />
        </el-form-item>
        <el-form-item label="正文内容" prop="content">
          <el-input
            v-model="articleFormData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入正文内容（支持 Markdown）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="articleSubmitting" @click="handleCreateArticle">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, Check, Lock, Plus, Star, View } from '@element-plus/icons-vue'
import { columnApi, articleApi, subscriptionApi } from '../api'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const columnId = computed(() => Number(route.params.id))

const column = ref(null)
const loading = ref(false)
const articles = ref([])
const articlesLoading = ref(false)
const isSubscribed = ref(false)

const isAuthor = computed(() => {
  if (!column.value || !userStore.isLoggedIn || !userStore.user) return false
  return column.value.author_id === userStore.user.id || column.value.author?.id === userStore.user.id
})

async function loadColumn() {
  loading.value = true
  try {
    column.value = await columnApi.getById(columnId.value)
    if (userStore.isLoggedIn) {
      try {
        const data = await subscriptionApi.check(columnId.value)
        isSubscribed.value = !!data?.is_subscribed || !!data?.subscribed
      } catch {
        isSubscribed.value = false
      }
    }
  } catch (e) {
    console.error(e)
    column.value = null
  } finally {
    loading.value = false
  }
}

async function loadArticles() {
  articlesLoading.value = true
  try {
    const data = await articleApi.getByColumn({
      column_id: columnId.value,
      page: 1,
      page_size: 100
    })
    articles.value = data.items || data.list || data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    articlesLoading.value = false
  }
}

function goArticleDetail(id) {
  router.push(`/article/${id}`)
}

function handleSubscribe() {
  router.push(`/subscribe/${columnId.value}`)
}

function goLogin() {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

const articleDialogVisible = ref(false)
const articleSubmitting = ref(false)
const articleFormRef = ref(null)

const articleFormData = ref({
  title: '',
  summary: '',
  is_free: false,
  trial_content: '',
  content: ''
})

const articleFormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入文章摘要', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入正文内容', trigger: 'blur' }
  ]
}

async function handleCreateArticle() {
  if (!articleFormRef.value) return
  try {
    await articleFormRef.value.validate()
  } catch {
    return
  }

  articleSubmitting.value = true
  try {
    const data = await articleApi.create({
      column_id: columnId.value,
      ...articleFormData.value
    })
    ElMessage.success('文章创建成功')
    articleDialogVisible.value = false
    articleFormData.value = {
      title: '',
      summary: '',
      is_free: false,
      trial_content: '',
      content: ''
    }
    if (articleFormRef.value) {
      articleFormRef.value.resetFields()
    }
    loadArticles()
    if (data?.id) {
      router.push(`/article/${data.id}`)
    }
  } catch (e) {
    console.error(e)
  } finally {
    articleSubmitting.value = false
  }
}

onMounted(() => {
  loadColumn()
  loadArticles()
})
</script>

<style scoped>
.column-detail {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.column-detail__main {
  min-height: 400px;
}

.column-detail__header {
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-bottom: 32px;
  overflow: hidden;
}

.column-detail__cover-wrapper {
  position: relative;
}

.column-detail__cover {
  width: 100%;
  height: 300px;
  display: block;
}

.column-detail__cover-placeholder {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.column-detail__tag {
  position: absolute;
  top: 16px;
  left: 16px;
}

.column-detail__info {
  padding: 24px;
}

.column-detail__title {
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}

.column-detail__desc {
  font-size: 15px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0 0 20px;
}

.column-detail__author-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.column-detail__author-info {
  flex: 1;
}

.column-detail__author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.column-detail__author-bio {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.column-detail__stats {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
}

.column-detail__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.column-detail__stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.column-detail__stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.column-detail__stat-value--price {
  color: var(--el-color-danger);
}

.column-detail__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.column-detail__articles-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--el-text-color-primary);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.column-detail__article-list {
  min-height: 200px;
}

.column-detail__article-card {
  cursor: pointer;
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.column-detail__article-card:hover {
  transform: translateY(-2px);
}

.column-detail__article-main {
  padding: 4px 0;
}

.column-detail__article-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
}

.column-detail__article-summary {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.column-detail__article-meta {
  display: flex;
  gap: 16px;
}

.column-detail__article-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
