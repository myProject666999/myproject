<template>
  <div class="review-page">
    <div class="page-header">
      <h2>随机回顾</h2>
      <div class="header-actions">
        <el-select v-model="selectedBook" placeholder="选择书籍" clearable style="width: 200px">
          <el-option
            v-for="book in allBooks"
            :key="book.id"
            :label="book.title"
            :value="book.id"
          />
        </el-select>
        <el-input-number v-model="reviewCount" :min="1" :max="20" />
        <el-button type="primary" @click="loadRandomNotes" :icon="Refresh">刷新</el-button>
      </div>
    </div>

    <div v-loading="loading" class="review-container">
      <div
        v-for="(note, index) in randomNotes"
        :key="note.id"
        class="review-card"
        :style="{ borderTopColor: note.highlightColor }"
      >
        <div class="card-index">
          <el-tag type="primary" round>{{ index + 1 }}</el-tag>
        </div>
        <div class="card-content">
          <div class="note-meta">
            <el-tag v-if="note.bookTitle" type="info" size="small">{{ note.bookTitle }}</el-tag>
            <span v-if="note.chapter" class="chapter">
              <el-icon size="14"><Collection /></el-icon>
              {{ note.chapter }}
            </span>
            <span v-if="note.pageNumber" class="page">
              <el-icon size="14"><Notebook /></el-icon>
              P{{ note.pageNumber }}
            </span>
          </div>
          <div
            class="note-text"
            :style="{ borderLeftColor: note.highlightColor, backgroundColor: note.highlightColor + '15' }"
          >
            "{{ note.content }}"
          </div>
          <div class="card-actions">
            <el-button size="small" @click="markAsReviewed(note.id)" :icon="Check">
              已复习 ({{ note.reviewCount || 0 }})
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="randomNotes.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无笔记可回顾" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Check, Collection, Notebook } from '@element-plus/icons-vue'
import { getBooks } from '../api/book'
import { getRandomNotes, getRandomNotesByBook, markReviewed } from '../api/note'

const loading = ref(false)
const randomNotes = ref([])
const allBooks = ref([])
const selectedBook = ref(null)
const reviewCount = ref(5)

const loadBooks = async () => {
  allBooks.value = await getBooks()
}

const loadRandomNotes = async () => {
  loading.value = true
  try {
    let data
    if (selectedBook.value) {
      data = await getRandomNotesByBook(selectedBook.value, reviewCount.value)
    } else {
      data = await getRandomNotes(reviewCount.value)
    }
    randomNotes.value = data
  } catch (e) {
    ElMessage.error('加载笔记失败')
  } finally {
    loading.value = false
  }
}

const markAsReviewed = async (noteId) => {
  try {
    const updated = await markReviewed(noteId)
    const note = randomNotes.value.find(n => n.id === noteId)
    if (note) {
      note.reviewCount = updated.reviewCount
      note.lastReviewedAt = updated.lastReviewedAt
    }
    ElMessage.success('已标记为复习')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadBooks()
  loadRandomNotes()
})
</script>

<style scoped>
.review-page {
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.review-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.review-card {
  background: #fff;
  border-radius: 12px;
  border-top: 4px solid #FFEB3B;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 16px;
}

.card-index {
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 16px;
}

.note-meta > span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-text {
  font-size: 17px;
  line-height: 2;
  color: #303133;
  padding: 20px 24px;
  border-left: 3px solid;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  padding: 80px 0;
}
</style>
