<template>
  <div class="notes-page">
    <div class="page-header">
      <h2>{{ currentBook ? `《${currentBook.title}》的笔记` : '全部笔记' }}</h2>
      <div class="header-actions">
        <el-select v-model="bookFilter" placeholder="筛选书籍" clearable @change="filterNotes">
          <el-option
            v-for="book in allBooks"
            :key="book.id"
            :label="book.title"
            :value="book.id"
          />
        </el-select>
        <el-button type="primary" @click="openAddDialog" :icon="Plus">添加笔记</el-button>
      </div>
    </div>

    <div v-loading="loading" class="notes-list">
      <div
        v-for="note in notes"
        :key="note.id"
        class="note-card"
        :style="{ borderLeftColor: note.highlightColor }"
      >
        <div class="note-header">
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
          <div class="note-actions">
            <el-tooltip content="收藏">
              <el-button
                size="small"
                text
                :type="note.isFavorite ? 'warning' : 'info'"
                @click="toggleFavorite(note)"
              >
                <el-icon :size="18">
                  <Star v-if="note.isFavorite" :fill="'#F59E0B'" />
                  <Star v-else />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-button size="small" text type="primary" @click="editNote(note)">
              <el-icon :size="16"><Edit /></el-icon>
            </el-button>
            <el-button size="small" text type="danger" @click="deleteNoteItem(note.id)">
              <el-icon :size="16"><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div
          class="note-content"
          :style="{ backgroundColor: note.highlightColor + '20' }"
        >
          {{ note.content }}
        </div>
        <div class="note-footer">
          <div class="note-tags">
            <el-tag
              v-for="tag in noteTagsMap[note.id] || []"
              :key="tag.id"
              :style="{ backgroundColor: tag.color + '30' }"
              :color="tag.color"
              size="small"
              effect="plain"
            >
              {{ tag.name }}
            </el-tag>
          </div>
          <div class="note-time">
            <el-icon size="14"><Clock /></el-icon>
            {{ formatDate(note.createdAt) }}
          </div>
        </div>
      </div>

      <div v-if="notes.length === 0" class="empty-state">
        <el-empty description="暂无笔记，点击上方按钮添加" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑笔记' : '添加笔记'" width="600px">
      <el-form :model="noteForm" :rules="rules" ref="noteFormRef" label-width="80px">
        <el-form-item label="所属书籍" prop="bookId">
          <el-select v-model="noteForm.note.bookId" placeholder="请选择书籍">
            <el-option
              v-for="book in allBooks"
              :key="book.id"
              :label="book.title"
              :value="book.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="笔记内容" prop="content">
          <el-input
            v-model="noteForm.note.content"
            type="textarea"
            :rows="4"
            placeholder="请输入笔记内容或金句摘录"
          />
        </el-form-item>
        <el-form-item label="章节">
          <el-input v-model="noteForm.note.chapter" placeholder="选填" />
        </el-form-item>
        <el-form-item label="页码">
          <el-input-number v-model="noteForm.note.pageNumber" :min="0" />
        </el-form-item>
        <el-form-item label="高亮颜色">
          <div class="color-picker">
            <div
              v-for="color in highlightColors"
              :key="color.value"
              class="color-option"
              :class="{ active: noteForm.note.highlightColor === color.value }"
              :style="{ backgroundColor: color.value }"
              @click="noteForm.note.highlightColor = color.value"
              :title="color.label"
            />
          </div>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="noteForm.tagIds"
            multiple
            filterable
            allow-create
            placeholder="选择或创建标签"
            @create="handleCreateTag"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            >
              <span class="tag-option">
                <span class="tag-dot" :style="{ backgroundColor: tag.color }" />
                {{ tag.name }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收藏">
          <el-switch v-model="noteForm.note.isFavorite" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNote">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Edit, Delete, Star, Clock, Collection, Notebook
} from '@element-plus/icons-vue'
import { getBooks } from '../api/book'
import {
  getNotes, getNotesByBook, getNoteTags, createNote, updateNote, deleteNote
} from '../api/note'
import { getTags, createTag } from '../api/tag'

const route = useRoute()
const loading = ref(false)
const notes = ref([])
const allBooks = ref([])
const allTags = ref([])
const noteTagsMap = ref({})
const dialogVisible = ref(false)
const isEdit = ref(false)
const noteFormRef = ref(null)
const bookFilter = ref(null)
const currentBookId = computed(() => route.params.bookId ? Number(route.params.bookId) : null)
const currentBook = computed(() => allBooks.value.find(b => b.id === currentBookId.value))

const highlightColors = [
  { label: '黄色', value: '#FFEB3B' },
  { label: '绿色', value: '#4CAF50' },
  { label: '蓝色', value: '#2196F3' },
  { label: '红色', value: '#F44336' },
  { label: '紫色', value: '#9C27B0' }
]

const noteForm = ref({
  note: {
    id: null,
    bookId: null,
    content: '',
    chapter: '',
    pageNumber: null,
    highlightColor: '#FFEB3B',
    isFavorite: false
  },
  tagIds: []
})

const rules = {
  'note.bookId': [{ required: true, message: '请选择书籍', trigger: 'change' }],
  'note.content': [{ required: true, message: '请输入笔记内容', trigger: 'blur' }]
}

const loadBooks = async () => {
  allBooks.value = await getBooks()
}

const loadTags = async () => {
  allTags.value = await getTags()
}

const loadNotes = async () => {
  loading.value = true
  try {
    let data
    if (currentBookId.value) {
      data = await getNotesByBook(currentBookId.value)
    } else if (bookFilter.value) {
      data = await getNotesByBook(bookFilter.value)
    } else {
      data = await getNotes()
    }
    notes.value = data
    loadNoteTags()
  } catch (e) {
    ElMessage.error('加载笔记失败')
  } finally {
    loading.value = false
  }
}

const loadNoteTags = async () => {
  const map = {}
  for (const note of notes.value) {
    try {
      map[note.id] = await getNoteTags(note.id)
    } catch (e) {
      map[note.id] = []
    }
  }
  noteTagsMap.value = map
}

const filterNotes = () => {
  loadNotes()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const openAddDialog = () => {
  isEdit.value = false
  noteForm.value = {
    note: {
      id: null,
      bookId: currentBookId.value || null,
      content: '',
      chapter: '',
      pageNumber: null,
      highlightColor: '#FFEB3B',
      isFavorite: false
    },
    tagIds: []
  }
  dialogVisible.value = true
}

const editNote = async (note) => {
  isEdit.value = true
  const tags = noteTagsMap.value[note.id] || []
  noteForm.value = {
    note: { ...note },
    tagIds: tags.map(t => t.id)
  }
  dialogVisible.value = true
}

const handleCreateTag = async (name) => {
  try {
    const newTag = await createTag({ name, color: '#2196F3' })
    allTags.value.push(newTag)
    noteForm.value.tagIds.push(newTag.id)
    ElMessage.success('标签创建成功')
  } catch (e) {
    ElMessage.error('标签创建失败')
  }
}

const saveNote = async () => {
  if (!noteFormRef.value) return
  await noteFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateNote(noteForm.value.note.id, noteForm.value)
          ElMessage.success('更新成功')
        } else {
          await createNote(noteForm.value)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadNotes()
      } catch (e) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      }
    }
  })
}

const toggleFavorite = async (note) => {
  const oldValue = note.isFavorite
  note.isFavorite = !note.isFavorite
  try {
    await updateNote(note.id, { note, tagIds: (noteTagsMap.value[note.id] || []).map(t => t.id) })
  } catch (e) {
    note.isFavorite = oldValue
    ElMessage.error('操作失败')
  }
}

const deleteNoteItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条笔记吗？', '提示', {
      type: 'warning'
    })
    await deleteNote(id)
    ElMessage.success('删除成功')
    loadNotes()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

watch(() => route.params.bookId, () => {
  loadNotes()
})

onMounted(() => {
  loadBooks()
  loadTags()
  loadNotes()
})
</script>

<style scoped>
.notes-page {
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
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-card {
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid #FFEB3B;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.note-meta > span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-actions {
  display: flex;
  gap: 4px;
}

.note-content {
  padding: 16px;
  border-radius: 6px;
  line-height: 1.8;
  color: #303133;
  font-size: 15px;
  margin-bottom: 12px;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-tags {
  display: flex;
  gap: 8px;
}

.note-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #c0c4cc;
}

.color-picker {
  display: flex;
  gap: 12px;
}

.color-option {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-option.active {
  border-color: #303133;
  transform: scale(1.1);
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.empty-state {
  padding: 60px 0;
}
</style>
