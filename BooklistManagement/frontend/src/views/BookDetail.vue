<template>
  <div class="book-detail-page" v-if="bookList">
    <el-button @click="goBack" class="back-btn">
      <el-icon><ArrowLeft /></el-icon>
      返回书架
    </el-button>

    <div class="book-detail-card">
      <div class="book-header">
        <div class="book-cover">
          <img :src="bookList.book.coverUrl" :alt="bookList.book.title" v-if="bookList.book.coverUrl" />
          <div class="book-cover-placeholder" v-else>
            <el-icon :size="64"><Picture /></el-icon>
          </div>
        </div>
        <div class="book-basic-info">
          <h1 class="book-title">{{ bookList.book.title }}</h1>
          <p class="book-subtitle" v-if="bookList.book.subtitle">{{ bookList.book.subtitle }}</p>
          <div class="book-meta">
            <span><strong>作者:</strong> {{ bookList.book.author }}</span>
            <span v-if="bookList.book.translator"><strong>译者:</strong> {{ bookList.book.translator }}</span>
            <span><strong>出版社:</strong> {{ bookList.book.publisher }}</span>
            <span v-if="bookList.book.publishDate"><strong>出版日期:</strong> {{ formatDate(bookList.book.publishDate) }}</span>
            <span v-if="bookList.book.pages"><strong>页数:</strong> {{ bookList.book.pages }}</span>
          </div>
          <div class="book-status">
            <el-tag :type="getStatusType(bookList.status)" size="large">
              {{ getStatusText(bookList.status) }}
            </el-tag>
            <el-rate
              v-if="bookList.rating"
              :model-value="bookList.rating"
              disabled
              size="large"
            />
          </div>
          <div class="book-actions">
            <el-dropdown @command="handleStatusChange">
              <el-button type="primary">
                切换状态 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="WISHLIST">想读</el-dropdown-item>
                  <el-dropdown-item command="READING">在读</el-dropdown-item>
                  <el-dropdown-item command="FINISHED">已读</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button @click="openEditDialog">编辑</el-button>
            <el-button type="danger" @click="handleDelete">删除</el-button>
          </div>
          <div class="book-tags">
            <el-tag
              v-for="tag in bookList.tags"
              :key="tag.id"
              :style="{ backgroundColor: tag.color, borderColor: tag.color }"
              effect="dark"
            >
              {{ tag.name }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="书籍简介" name="summary">
          <div class="summary-content">
            {{ bookList.book.summary || '暂无简介' }}
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的笔记" name="review" v-if="bookList.status === 'FINISHED'">
          <div class="review-content">
            {{ bookList.review || '暂无笔记' }}
          </div>
        </el-tab-pane>

        <el-tab-pane label="阅读记录" name="records">
          <div class="records-section">
            <div class="records-header">
              <h3>阅读记录</h3>
              <el-button type="primary" size="small" @click="openRecordDialog">
                <el-icon><Plus /></el-icon>
                添加记录
              </el-button>
            </div>
            <div v-if="readingRecords.length === 0" class="empty-records">
              暂无阅读记录
            </div>
            <div v-else class="records-list">
              <div v-for="record in readingRecords" :key="record.id" class="record-item">
                <div class="record-date">{{ formatDate(record.readDate) }}</div>
                <div class="record-info">
                  <span class="record-duration">
                    <el-icon><Timer /></el-icon>
                    {{ record.durationMinutes }}分钟
                  </span>
                  <span class="record-pages" v-if="record.pagesRead">
                    读了{{ record.pagesRead }}页
                  </span>
                </div>
                <p class="record-note" v-if="record.note">{{ record.note }}</p>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="deleteRecord(record.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="editDialogVisible" title="编辑书籍" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="评分" v-if="bookList.status === 'FINISHED'">
          <el-rate v-model="editForm.rating" />
        </el-form-item>
        <el-form-item label="笔记">
          <el-input
            v-model="editForm.review"
            type="textarea"
            :rows="4"
            placeholder="写下你的阅读感想..."
          />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="editForm.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" v-if="bookList.status === 'FINISHED'">
          <el-date-picker
            v-model="editForm.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordDialogVisible" title="添加阅读记录" width="500px">
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="阅读日期">
          <el-date-picker
            v-model="recordForm.readDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="阅读时长">
          <el-input-number
            v-model="recordForm.durationMinutes"
            :min="1"
            :max="1440"
            suffix="分钟"
          />
        </el-form-item>
        <el-form-item label="阅读页数">
          <el-input-number v-model="recordForm.pagesRead" :min="0" />
        </el-form-item>
        <el-form-item label="笔记">
          <el-input
            v-model="recordForm.note"
            type="textarea"
            :rows="3"
            placeholder="写下阅读笔记..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRecordSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { booklistAPI } from '@/api'

const route = useRoute()
const router = useRouter()
const bookList = ref(null)
const readingRecords = ref([])
const activeTab = ref('summary')
const editDialogVisible = ref(false)
const recordDialogVisible = ref(false)
const editForm = ref({})
const recordForm = ref({
  readDate: new Date().toISOString().split('T')[0],
  durationMinutes: 30,
  pagesRead: null,
  note: ''
})

const loadBookDetail = async () => {
  try {
    bookList.value = await booklistAPI.getBookList(route.params.id)
    editForm.value = {
      rating: bookList.value.rating,
      review: bookList.value.review,
      startDate: bookList.value.startDate,
      endDate: bookList.value.endDate
    }
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const loadReadingRecords = async () => {
  try {
    readingRecords.value = await booklistAPI.getReadingRecords(route.params.id)
  } catch (error) {
    console.error('加载阅读记录失败')
  }
}

const handleStatusChange = async (status) => {
  try {
    await booklistAPI.updateStatus(route.params.id, status)
    ElMessage.success('状态已更新')
    loadBookDetail()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const openEditDialog = () => {
  editDialogVisible.value = true
}

const handleEditSubmit = async () => {
  try {
    await booklistAPI.updateBookList(route.params.id, editForm.value)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadBookDetail()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const openRecordDialog = () => {
  recordForm.value = {
    readDate: new Date().toISOString().split('T')[0],
    durationMinutes: 30,
    pagesRead: null,
    note: ''
  }
  recordDialogVisible.value = true
}

const handleRecordSubmit = async () => {
  if (!recordForm.value.readDate) {
    ElMessage.warning('请选择阅读日期')
    return
  }
  try {
    await booklistAPI.createReadingRecord({
      ...recordForm.value,
      bookListId: route.params.id
    })
    ElMessage.success('添加成功')
    recordDialogVisible.value = false
    loadReadingRecords()
    loadBookDetail()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const deleteRecord = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      type: 'warning'
    })
    await booklistAPI.deleteReadingRecord(id)
    ElMessage.success('删除成功')
    loadReadingRecords()
    loadBookDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这本书吗？', '提示', {
      type: 'warning'
    })
    await booklistAPI.deleteBookList(route.params.id)
    ElMessage.success('删除成功')
    router.push('/')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const goBack = () => {
  router.push('/')
}

const getStatusText = (status) => {
  const map = {
    WISHLIST: '想读',
    READING: '在读',
    FINISHED: '已读'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    WISHLIST: 'info',
    READING: 'warning',
    FINISHED: 'success'
  }
  return map[status] || ''
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadBookDetail()
  loadReadingRecords()
})
</script>

<style scoped>
.book-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 24px;
}

.book-detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.book-header {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #ebeef5;
}

.book-cover {
  width: 240px;
  height: 340px;
  background: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-cover-placeholder {
  color: #c0c4cc;
}

.book-basic-info {
  flex: 1;
}

.book-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.book-subtitle {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #909399;
}

.book-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 24px;
  color: #606266;
}

.book-meta span {
  font-size: 14px;
}

.book-meta strong {
  color: #303133;
}

.book-status {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.book-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.book-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tabs {
  margin-top: 24px;
}

.summary-content,
.review-content {
  line-height: 1.8;
  color: #606266;
  padding: 16px 0;
  white-space: pre-wrap;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.records-header h3 {
  margin: 0;
  font-size: 16px;
}

.empty-records {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  position: relative;
}

.record-date {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.record-info {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.record-duration,
.record-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.record-note {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}
</style>
