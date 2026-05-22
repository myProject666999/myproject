<template>
  <div>
    <AppHeader />
    <div class="app-container" v-loading="loading">
      <div v-if="comic" class="comic-detail">
        <div class="comic-header">
          <div class="comic-cover">
            <img :src="comic.cover" :alt="comic.title" />
          </div>
          <div class="comic-info">
            <h1 class="comic-title">{{ comic.title }}</h1>
            <div class="comic-meta">
              <span class="meta-item">
                <el-icon><User /></el-icon>
                {{ comic.author_name }}
              </span>
              <span class="meta-item">
                <el-icon><Collection /></el-icon>
                {{ comic.category }}
              </span>
              <span class="meta-item">
                <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
              </span>
            </div>
            <div class="comic-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ formatNumber(comic.views) }} 阅读
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ formatNumber(comic.likes) }} 收藏
              </span>
              <span class="stat-item">
                <el-icon><Notebook /></el-icon>
                {{ comic.chapter_count }} 话
              </span>
            </div>
            <p class="comic-desc">{{ comic.description || '暂无简介' }}</p>
            
            <div class="comic-actions">
              <el-button 
                type="primary" 
                size="large"
                @click="handleRead"
              >
                <el-icon><Reading /></el-icon>
                开始阅读
              </el-button>
              <el-button 
                size="large"
                :type="isSubscribed ? 'success' : 'default'"
                @click="handleSubscribe"
                :loading="subscribing"
              >
                <el-icon><Bell /></el-icon>
                {{ isSubscribed ? '已订阅' : '订阅追更' }}
              </el-button>
              <el-button 
                size="large"
                :type="isFavorited ? 'warning' : 'default'"
                @click="handleFavorite"
                :loading="favoriting"
              >
                <el-icon><Star /></el-icon>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="comic-body">
          <div class="chapters-section">
            <h2 class="section-title">章节目录</h2>
            <div class="chapters-list">
              <div
                v-for="chapter in chapters"
                :key="chapter.id"
                class="chapter-item"
                @click="handleChapterClick(chapter)"
              >
                <span class="chapter-number">第{{ chapter.chapter_number }}话</span>
                <span class="chapter-title">{{ chapter.title }}</span>
                <span class="chapter-date">{{ formatDate(chapter.created_at) }}</span>
              </div>
            </div>
            <div v-if="chapters.length === 0" class="empty-state">
              <el-empty description="暂无章节" />
            </div>
          </div>

          <div class="comments-section">
            <h2 class="section-title">评论区</h2>
            
            <div v-if="userStore.isLoggedIn" class="comment-input">
              <el-input
                v-model="commentContent"
                type="textarea"
                :rows="3"
                placeholder="发表你的评论..."
                maxlength="500"
                show-word-limit
              />
              <el-button 
                type="primary" 
                class="submit-btn"
                :disabled="!commentContent.trim()"
                :loading="submittingComment"
                @click="submitComment"
              >
                发表评论
              </el-button>
            </div>
            <div v-else class="login-tip">
              <el-alert
                title="请先登录后再发表评论"
                type="info"
                show-icon
                :closable="false"
              >
                <template #default>
                  <el-button size="small" type="primary" @click="$router.push('/login')">
                    去登录
                  </el-button>
                </template>
              </el-alert>
            </div>

            <div class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar :size="40" :src="comment.avatar">
                  {{ comment.username?.[0]?.toUpperCase() }}
                </el-avatar>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-username">{{ comment.username }}</span>
                    <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <el-button 
                      link 
                      type="primary" 
                      @click="handleLikeComment(comment)"
                    >
                      <el-icon><Star /></el-icon>
                      {{ comment.likes || 0 }}
                    </el-button>
                    <el-button 
                      v-if="comment.user_id === userStore.userInfo?.id || userStore.isAdmin"
                      link 
                      type="danger" 
                      @click="handleDeleteComment(comment)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="comments.length === 0 && !loadingComments" class="empty-state">
              <el-empty description="暂无评论，快来抢沙发吧！" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { comicApi, chapterApi, subscriptionApi, favoriteApi, commentApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const comicId = route.params.id
const comic = ref(null)
const chapters = ref([])
const comments = ref([])
const loading = ref(false)
const loadingComments = ref(false)
const subscribing = ref(false)
const favoriting = ref(false)
const submittingComment = ref(false)
const commentContent = ref('')
const isSubscribed = ref(false)
const isFavorited = ref(false)

const statusType = computed(() => {
  const map = { ongoing: 'success', completed: 'info', hiatus: 'warning' }
  return map[comic.value?.status] || 'info'
})

const statusText = computed(() => {
  const map = { ongoing: '连载中', completed: '已完结', hiatus: '暂停更新' }
  return map[comic.value?.status] || '未知'
})

onMounted(() => {
  fetchComicDetail()
  fetchChapters()
  fetchComments()
})

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num || 0
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

async function fetchComicDetail() {
  loading.value = true
  try {
    const res = await comicApi.getDetail(comicId)
    comic.value = res.comic
    isSubscribed.value = res.comic.is_subscribed
    isFavorited.value = res.comic.is_favorited
  } catch (error) {
    console.error('获取漫画详情失败', error)
  } finally {
    loading.value = false
  }
}

async function fetchChapters() {
  try {
    const res = await chapterApi.getList(comicId)
    chapters.value = res.chapters || []
  } catch (error) {
    console.error('获取章节列表失败', error)
  }
}

async function fetchComments() {
  loadingComments.value = true
  try {
    const res = await commentApi.getList({ comicId })
    comments.value = res.comments || []
  } catch (error) {
    console.error('获取评论失败', error)
  } finally {
    loadingComments.value = false
  }
}

function handleRead() {
  if (chapters.value.length > 0) {
    const firstChapter = chapters.value[0]
    router.push(`/read/${comicId}/chapter/${firstChapter.id}`)
  } else {
    ElMessage.warning('暂无章节')
  }
}

function handleChapterClick(chapter) {
  router.push(`/read/${comicId}/chapter/${chapter.id}`)
}

async function handleSubscribe() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  subscribing.value = true
  try {
    const res = await subscriptionApi.toggle(comicId)
    isSubscribed.value = res.subscribed
    ElMessage.success(res.message)
  } catch (error) {
    console.error('操作失败', error)
  } finally {
    subscribing.value = false
  }
}

async function handleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  favoriting.value = true
  try {
    const res = await favoriteApi.toggle(comicId)
    isFavorited.value = res.favorited
    ElMessage.success(res.message)
  } catch (error) {
    console.error('操作失败', error)
  } finally {
    favoriting.value = false
  }
}

async function submitComment() {
  if (!commentContent.value.trim()) return
  
  submittingComment.value = true
  try {
    const res = await commentApi.create({
      comicId,
      content: commentContent.value
    })
    comments.value.unshift(res.comment)
    commentContent.value = ''
    ElMessage.success('评论成功')
  } catch (error) {
    console.error('评论失败', error)
  } finally {
    submittingComment.value = false
  }
}

async function handleLikeComment(comment) {
  try {
    const res = await commentApi.like(comment.id)
    comment.likes = res.likes
  } catch (error) {
    console.error('点赞失败', error)
  }
}

async function handleDeleteComment(comment) {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await commentApi.delete(comment.id)
    comments.value = comments.value.filter(c => c.id !== comment.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}
</script>

<style scoped>
.comic-detail {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.comic-header {
  display: flex;
  gap: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.comic-cover {
  flex-shrink: 0;
  width: 240px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.comic-cover img {
  width: 100%;
  display: block;
}

.comic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.comic-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
}

.comic-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comic-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comic-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 24px;
  flex: 1;
}

.comic-actions {
  display: flex;
  gap: 12px;
}

.comic-body {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  padding: 24px 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

.chapters-section {
  min-width: 0;
}

.chapters-list {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.chapter-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-item:hover {
  background: #f5f7fa;
}

.chapter-number {
  width: 80px;
  font-weight: 500;
  color: #409eff;
}

.chapter-title {
  flex: 1;
  color: #303133;
}

.chapter-date {
  font-size: 12px;
  color: #909399;
}

.comments-section {
  min-width: 0;
}

.comment-input {
  margin-bottom: 24px;
}

.submit-btn {
  margin-top: 12px;
}

.login-tip {
  margin-bottom: 24px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.comment-username {
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  gap: 16px;
}
</style>
