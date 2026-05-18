<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">日记列表</h1>
      <p class="page-subtitle">回顾过去的心情和故事</p>
    </div>

    <div v-if="loading" style="text-align: center; padding: 60px;">
      <el-icon :size="40" class="is-loading"><Loading /></el-icon>
    </div>

    <div v-else-if="diaries.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <div>还没有日记，去写第一篇吧！</div>
    </div>

    <div v-else>
      <div
        v-for="diary in diaries"
        :key="diary.id"
        class="diary-item"
        @click="viewDiary(diary)"
      >
        <div class="diary-item-header">
          <h3 class="diary-item-title">{{ diary.title }}</h3>
          <div
            class="mood-score-badge"
            :class="getScoreClass(diary.moodScore)"
          >
            {{ diary.moodScore }}
          </div>
        </div>
        <div class="diary-item-date">
          {{ formatDate(diary.diaryDate) }} · {{ diary.moodSummary }}
        </div>
        <div
          class="diary-item-preview"
          v-html="stripHtml(diary.content)"
        ></div>
        <div v-if="diary.tags && diary.tags.length > 0" style="margin-top: 12px;">
          <span
            v-for="tag in diary.tags.slice(0, 5)"
            :key="tag.id"
            class="mood-tag"
            :class="getTagClass(tag.category)"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="日记详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedDiary">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div
            class="mood-score-badge"
            :class="getScoreClass(selectedDiary.moodScore)"
            style="margin-right: 16px;"
          >
            {{ selectedDiary.moodScore }}
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 600;">{{ selectedDiary.title }}</div>
            <div style="color: #909399; font-size: 14px;">
              {{ formatDate(selectedDiary.diaryDate) }}
            </div>
          </div>
        </div>

        <el-alert
          :title="selectedDiary.moodSummary"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <div v-if="selectedDiary.tags && selectedDiary.tags.length > 0" style="margin-bottom: 20px;">
          <span
            v-for="tag in selectedDiary.tags"
            :key="tag.id"
            class="mood-tag"
            :class="getTagClass(tag.category)"
          >
            {{ tag.name }}
          </span>
        </div>

        <div
          class="diary-content"
          v-html="selectedDiary.content"
        ></div>
      </div>
      <template #footer>
        <el-button type="danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getDiaryList, deleteDiary } from '../api/diary'

const loading = ref(false)
const diaries = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const selectedDiary = ref(null)

const loadDiaries = async () => {
  loading.value = true
  try {
    const res = await getDiaryList({
      userId: 1,
      page: currentPage.value,
      size: pageSize.value
    })
    if (res.data.code === 200) {
      diaries.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日 dddd')
}

const stripHtml = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const getScoreClass = (score) => {
  if (score >= 7) return 'mood-score-high'
  if (score >= 4) return 'mood-score-medium'
  return 'mood-score-low'
}

const getTagClass = (category) => {
  switch (category) {
    case '积极': return 'positive'
    case '消极': return 'negative'
    default: return 'neutral'
  }
}

const viewDiary = (diary) => {
  selectedDiary.value = diary
  dialogVisible.value = true
}

const handleDelete = async () => {
  if (!selectedDiary.value) return

  try {
    await ElMessageBox.confirm(
      '确定要删除这篇日记吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await deleteDiary(selectedDiary.value.id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      dialogVisible.value = false
      loadDiaries()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadDiaries()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadDiaries()
}

onMounted(() => {
  loadDiaries()
})
</script>

<style scoped>
.diary-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.diary-content {
  line-height: 1.8;
  color: #303133;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
}

.diary-content :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
