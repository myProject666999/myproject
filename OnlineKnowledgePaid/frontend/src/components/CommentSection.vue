<template>
  <div class="comment-section">
    <h3 class="comment-section__title">评论 ({{ total }})</h3>

    <el-card v-if="userStore.isLoggedIn" class="comment-section__input-card" shadow="never">
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="3"
        placeholder="写下你的评论..."
        maxlength="500"
        show-word-limit
        :disabled="submitting"
      />
      <div class="comment-section__input-actions">
        <el-button
          type="primary"
          :disabled="!newComment.trim() || submitting"
          :loading="submitting"
          @click="submitComment"
        >
          发表评论
        </el-button>
      </div>
    </el-card>

    <el-alert
      v-else
      title="登录后可发表评论"
      type="info"
      :closable="false"
      show-icon
      class="comment-section__alert"
    />

    <div v-loading="loading" class="comment-section__list">
      <template v-if="comments.length > 0">
        <el-list>
          <el-list-item v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-item__main">
              <el-avatar :size="40" :src="comment.user?.avatar">
                {{ (comment.user?.username || 'U').charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="comment-item__body">
                <div class="comment-item__meta">
                  <span class="comment-item__username">{{ comment.user?.username || '匿名用户' }}</span>
                  <span class="comment-item__time">{{ formatTime(comment.created_at) }}</span>
                </div>
                <div class="comment-item__content">{{ comment.content }}</div>
                <div class="comment-item__actions">
                  <el-button
                    :type="comment.is_liked ? 'danger' : 'default'"
                    size="small"
                    text
                    @click="toggleLike(comment)"
                  >
                    <el-icon><Star /></el-icon>
                    <span>{{ comment.like_count || 0 }}</span>
                  </el-button>
                  <el-button
                    v-if="isOwner(comment)"
                    type="danger"
                    size="small"
                    text
                    @click="handleDelete(comment)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </el-list-item>
        </el-list>

        <div class="comment-section__pagination">
          <el-pagination
            v-if="total > pageSize"
            background
            layout="prev, pager, next"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
          />
        </div>
      </template>

      <el-empty v-else description="暂无评论，来抢沙发吧~" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, Delete } from '@element-plus/icons-vue'
import { commentApi, likeApi } from '../api'
import { useUserStore } from '../stores/user'

const props = defineProps({
  articleId: {
    type: Number,
    required: true
  }
})

const userStore = useUserStore()

const comments = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const submitting = ref(false)
const newComment = ref('')

const isLoggedIn = computed(() => userStore.isLoggedIn)

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function isOwner(comment) {
  if (!userStore.isLoggedIn || !userStore.user) return false
  return comment.user_id === userStore.user.id || comment.user?.id === userStore.user.id
}

async function loadComments() {
  loading.value = true
  try {
    const data = await commentApi.getByArticle({
      article_id: props.articleId,
      page: currentPage.value,
      page_size: pageSize.value
    })
    comments.value = data.items || data.list || data.data || []
    total.value = data.total || comments.value.length
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  const content = newComment.value.trim()
  if (!content) return
  submitting.value = true
  try {
    await commentApi.create({
      article_id: props.articleId,
      content
    })
    ElMessage.success('评论发表成功')
    newComment.value = ''
    currentPage.value = 1
    await loadComments()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(comment) {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗?', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await commentApi.delete(comment.id)
    ElMessage.success('评论已删除')
    if (comments.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }
    await loadComments()
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') console.error(e)
  }
}

async function toggleLike(comment) {
  try {
    const data = await likeApi.toggle({
      target_id: comment.id,
      target_type: 'comment'
    })
    comment.is_liked = !!data?.is_liked
    comment.like_count = data?.like_count ?? (comment.like_count || 0) + (comment.is_liked ? 1 : -1)
    if (comment.like_count < 0) comment.like_count = 0
  } catch (e) {
    console.error(e)
  }
}

function handlePageChange(page) {
  currentPage.value = page
  loadComments()
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  margin-top: 32px;
}

.comment-section__title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.comment-section__input-card {
  margin-bottom: 16px;
}

.comment-section__input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.comment-section__alert {
  margin-bottom: 16px;
}

.comment-section__list {
  min-height: 200px;
}

.comment-section__pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item__main {
  display: flex;
  gap: 12px;
}

.comment-item__body {
  flex: 1;
  min-width: 0;
}

.comment-item__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.comment-item__username {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.comment-item__time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.comment-item__content {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-item__actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
</style>
