<template>
  <div class="books-page">
    <div class="page-header">
      <h2>我的书架</h2>
      <el-button type="primary" @click="openAddDialog" :icon="Plus">添加书籍</el-button>
    </div>

    <div v-loading="loading" class="books-grid">
      <div
        v-for="book in books"
        :key="book.id"
        class="book-card"
        @click="goToNotes(book.id)"
      >
        <div class="book-cover">
          <img v-if="book.coverUrl" :src="book.coverUrl" :alt="book.title" />
          <div v-else class="default-cover">
            <el-icon :size="48" color="#fff"><Reading /></el-icon>
          </div>
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
          <div class="book-progress">
            <el-progress
              :percentage="getProgress(book)"
              :status="book.status === 'FINISHED' ? 'success' : ''"
              :stroke-width="6"
            />
          </div>
          <div class="book-actions" @click.stop>
            <el-button size="small" text type="primary" @click="editBook(book)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" text type="danger" @click="deleteBookItem(book.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="books.length === 0" class="empty-state">
        <el-empty description="暂无书籍，点击上方按钮添加" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑书籍' : '添加书籍'" width="500px">
      <el-form :model="bookForm" :rules="rules" ref="bookFormRef" label-width="80px">
        <el-form-item label="书名" prop="title">
          <el-input v-model="bookForm.title" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="封面URL">
          <el-input v-model="bookForm.coverUrl" placeholder="可从豆瓣获取封面链接" />
        </el-form-item>
        <el-form-item label="总页数">
          <el-input-number v-model="bookForm.totalPages" :min="0" />
        </el-form-item>
        <el-form-item label="当前页">
          <el-input-number v-model="bookForm.currentPage" :min="0" :max="bookForm.totalPages" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="bookForm.status">
            <el-option label="未开始" value="NOT_STARTED" />
            <el-option label="阅读中" value="READING" />
            <el-option label="已读完" value="FINISHED" />
          </el-select>
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="bookForm.isbn" placeholder="选填" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="bookForm.description" type="textarea" :rows="3" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBook">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Reading, Edit, Delete } from '@element-plus/icons-vue'
import { getBooks, createBook, updateBook, deleteBook } from '../api/book'

const router = useRouter()
const loading = ref(false)
const books = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const bookFormRef = ref(null)
const bookForm = ref({
  id: null,
  title: '',
  author: '',
  coverUrl: '',
  totalPages: 0,
  currentPage: 0,
  status: 'NOT_STARTED',
  isbn: '',
  description: ''
})

const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }]
}

const loadBooks = async () => {
  loading.value = true
  try {
    books.value = await getBooks()
  } catch (e) {
    ElMessage.error('加载书籍失败')
  } finally {
    loading.value = false
  }
}

const getProgress = (book) => {
  if (!book.totalPages) return 0
  return Math.round((book.currentPage / book.totalPages) * 100)
}

const goToNotes = (bookId) => {
  router.push(`/notes/book/${bookId}`)
}

const openAddDialog = () => {
  isEdit.value = false
  bookForm.value = {
    id: null,
    title: '',
    author: '',
    coverUrl: '',
    totalPages: 0,
    currentPage: 0,
    status: 'NOT_STARTED',
    isbn: '',
    description: ''
  }
  dialogVisible.value = true
}

const editBook = (book) => {
  isEdit.value = true
  bookForm.value = { ...book }
  dialogVisible.value = true
}

const saveBook = async () => {
  if (!bookFormRef.value) return
  await bookFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateBook(bookForm.value.id, bookForm.value)
          ElMessage.success('更新成功')
        } else {
          await createBook(bookForm.value)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadBooks()
      } catch (e) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      }
    }
  })
}

const deleteBookItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这本书吗？相关笔记也会被删除', '提示', {
      type: 'warning'
    })
    await deleteBook(id)
    ElMessage.success('删除成功')
    loadBooks()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadBooks()
})
</script>

<style scoped>
.books-page {
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

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.book-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.book-cover {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-info {
  padding: 16px;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}

.book-progress {
  margin-bottom: 8px;
}

.book-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>
