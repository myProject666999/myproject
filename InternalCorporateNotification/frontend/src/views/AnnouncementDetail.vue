<template>
  <div class="page-container">
    <div class="card">
      <div class="detail-header">
        <el-button link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <div class="detail-actions" v-if="userStore.isAdmin">
          <el-button type="primary" size="small" @click="viewStatistics">
            <el-icon><DataAnalysis /></el-icon>
            查看统计
          </el-button>
          <el-button type="success" size="small" @click="editAnnouncement" v-if="announcement.status === 1">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="deleteAnnouncement">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>

      <div class="detail-content" v-if="announcement">
        <h1 class="detail-title">{{ announcement.title }}</h1>
        <div class="detail-meta">
          <span v-if="announcement.priority === 1" class="tag-top">置顶</span>
          <span v-if="announcement.type === 2" class="tag-emergency ml-10">紧急</span>
          <span class="ml-10">{{ announcement.publisherName }}</span>
          <span class="dot">·</span>
          <span>{{ announcement.departmentName || announcement.categoryName }}</span>
          <span class="dot">·</span>
          <span>{{ formatDate(announcement.publishTime) }}</span>
          <span class="dot">·</span>
          <span>阅读 {{ announcement.readCount }}</span>
        </div>

        <div class="content-body" v-html="announcement.content"></div>

        <div class="attachment-section" v-if="attachments.length > 0">
          <h3 class="section-title">
            <el-icon><Paperclip /></el-icon>
            附件 ({{ attachments.length }})
          </h3>
          <div class="attachment-list">
            <div
              v-for="file in attachments"
              :key="file.id"
              class="attachment-item"
            >
              <el-icon class="file-icon"><Document /></el-icon>
              <div class="file-info">
                <div class="file-name">{{ file.fileName }}</div>
                <div class="file-meta">
                  {{ formatFileSize(file.fileSize) }} · 下载 {{ file.downloadCount }} 次
                </div>
              </div>
              <el-button type="primary" size="small" @click="downloadFile(file)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </div>
          </div>
        </div>

        <div class="comment-section">
          <h3 class="section-title">
            <el-icon><ChatDotRound /></el-icon>
            评论 ({{ comments.length }})
          </h3>
          <div class="comment-input">
            <el-input
              v-model="commentText"
              type="textarea"
              :rows="3"
              placeholder="写下您的评论..."
              maxlength="500"
              show-word-limit
            />
            <div class="comment-actions">
              <el-button type="primary" :disabled="!commentText.trim()" @click="submitComment">
                发表评论
              </el-button>
            </div>
          </div>
          <div class="comment-list" v-if="comments.length > 0">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <el-avatar :size="40">
                  {{ comment.userName?.charAt(0) || 'U' }}
                </el-avatar>
              </div>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.userName }}</span>
                  <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                  <el-button
                    v-if="userStore.userInfo.userId === comment.userId"
                    type="danger"
                    link
                    size="small"
                    @click="deleteComment(comment.id)"
                  >
                    删除
                  </el-button>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无评论，快来抢沙发吧~" />
        </div>
      </div>

      <el-empty v-else description="公告不存在或已被删除" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import {
  getAnnouncement,
  getAttachments,
  getComments,
  addComment,
  deleteComment as apiDeleteComment,
  deleteAnnouncement as apiDeleteAnnouncement
} from '@/api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const announcement = ref(null)
const attachments = ref([])
const comments = ref([])
const commentText = ref('')

const id = route.params.id

onMounted(() => {
  loadDetail()
})

async function loadDetail() {
  try {
    const [annRes, attachRes, commentRes] = await Promise.all([
      getAnnouncement(id),
      getAttachments(id),
      getComments(id)
    ])
    announcement.value = annRes.data
    attachments.value = attachRes.data || []
    comments.value = commentRes.data || []
  } catch (e) {}
}

function viewStatistics() {
  router.push(`/statistics?announcementId=${id}`)
}

function editAnnouncement() {
  router.push(`/publish?id=${id}`)
}

function deleteAnnouncement() {
  ElMessageBox.confirm('确定要删除该公告吗？此操作不可恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteAnnouncement(id)
      ElMessage.success('删除成功')
      router.push('/announcements')
    } catch (e) {}
  }).catch(() => {})
}

async function submitComment() {
  try {
    await addComment({
      announcementId: id,
      content: commentText.value.trim(),
      parentId: 0
    })
    ElMessage.success('评论成功')
    commentText.value = ''
    loadDetail()
  } catch (e) {}
}

async function deleteComment(commentId) {
  ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteComment(commentId)
      ElMessage.success('删除成功')
      loadDetail()
    } catch (e) {}
  }).catch(() => {})
}

function downloadFile(file) {
  window.open(`/api/attachments/download/${file.id}`, '_blank')
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function formatFileSize(bytes) {
  if (!bytes) return '未知'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.detail-meta {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.dot {
  margin: 0 8px;
}

.ml-10 {
  margin-left: 10px;
}

.content-body {
  font-size: 15px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 30px;
}

.content-body :deep(img) {
  max-width: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #303133;
  gap: 6px;
}

.attachment-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.comment-section {
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.comment-input {
  margin-bottom: 25px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.comment-author {
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 6px;
}
</style>
