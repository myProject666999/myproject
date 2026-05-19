<template>
  <div class="notes-page">
    <div class="page-header">
      <h1 class="page-title">所有笔记</h1>
    </div>

    <div class="card">
      <div v-loading="loading" class="notes-container">
        <div v-if="notes.length > 0" class="notes-list">
          <div 
            v-for="note in notes" 
            :key="note.id"
            class="note-card"
          >
            <div class="note-card-header">
              <h4 class="note-title">{{ note.title || '无标题笔记' }}</h4>
              <div class="note-actions">
                <el-button 
                  size="small"
                  @click="goToPaper(note.paperId)"
                >
                  查看论文
                </el-button>
              </div>
            </div>
            <p class="note-content">{{ note.content }}</p>
            <div class="note-meta">
              <span class="paper-name">
                <el-icon><Document /></el-icon>
                {{ note.paperTitle }}
              </span>
              <span v-if="note.pageNumber" class="page-info">
                第 {{ note.pageNumber }} 页
              </span>
              <span class="time">{{ formatDate(note.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty description="暂无笔记" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { noteApi } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()

const loading = ref(false)
const notes = ref([])

const loadNotes = async () => {
  loading.value = true
  try {
    const res = await noteApi.getAll()
    if (res.success) {
      notes.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载笔记失败')
  } finally {
    loading.value = false
  }
}

const goToPaper = (paperId) => {
  router.push(`/paper/${paperId}`)
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadNotes()
})
</script>

<style scoped>
.notes-page {
  min-height: 100%;
}

.notes-container {
  min-height: 300px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-card {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.note-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.note-actions {
  flex-shrink: 0;
}

.note-content {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.note-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 13px;
  color: #909399;
}

.paper-name {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-info, .time {
  display: inline-flex;
  align-items: center;
}
</style>
