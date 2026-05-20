<template>
  <div class="bookshelf-page">
    <div class="page-header">
      <h2>我的书架</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加书籍
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="bookshelf-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="想读" name="WISHLIST" />
      <el-tab-pane label="在读" name="READING" />
      <el-tab-pane label="已读" name="FINISHED" />
    </el-tabs>

    <div class="book-grid">
      <div
        v-for="book in bookList"
        :key="book.id"
        class="book-card"
        @click="goToDetail(book.id)"
      >
        <div class="book-cover">
          <img :src="book.book.coverUrl" :alt="book.book.title" v-if="book.book.coverUrl" />
          <div class="book-cover-placeholder" v-else>
            <el-icon :size="48"><Picture /></el-icon>
          </div>
        </div>
        <div class="book-info">
          <h4 class="book-title">{{ book.book.title }}</h4>
          <p class="book-author">{{ book.book.author }}</p>
          <div class="book-tags">
            <el-tag
              v-for="tag in book.tags"
              :key="tag.id"
              :style="{ backgroundColor: tag.color, borderColor: tag.color }"
              size="small"
              effect="dark"
            >
              {{ tag.name }}
            </el-tag>
          </div>
          <div class="book-footer">
            <el-rate
              v-if="book.rating"
              :model-value="book.rating"
              disabled
              size="small"
            />
            <span class="reading-time" v-if="book.totalReadingMinutes">
              <el-icon><Timer /></el-icon>
              {{ formatDuration(book.totalReadingMinutes) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="bookList.length === 0" description="暂无书籍" />

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑书籍' : '添加书籍'"
      width="600px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="ISBN">
          <div class="isbn-search">
            <el-input
              v-model="isbnInput"
              placeholder="输入ISBN搜索书籍信息"
              @keyup.enter="searchIsbn"
            />
            <el-button type="primary" @click="searchIsbn">搜索</el-button>
          </div>
        </el-form-item>
        <el-form-item label="书名" prop="title">
          <el-input v-model="form.book.title" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="form.book.subtitle" placeholder="请输入副标题" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.book.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="form.book.publisher" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="页数">
          <el-input-number v-model="form.book.pages" :min="1" />
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="form.book.coverUrl" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input
            v-model="form.book.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入书籍简介"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="想读" value="WISHLIST" />
            <el-option label="在读" value="READING" />
            <el-option label="已读" value="FINISHED" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="selectedTags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或创建标签"
            @change="handleTagChange"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag"
            >
              <span :style="{ color: tag.color }">{{ tag.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="评分" v-if="form.status === 'FINISHED'">
          <el-rate v-model="form.rating" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { booklistAPI } from '@/api'

const router = useRouter()
const activeTab = ref('WISHLIST')
const bookList = ref([])
const allTags = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const isbnInput = ref('')
const selectedTags = ref([])
const form = ref({
  book: {},
  status: 'WISHLIST',
  tags: []
})

const loadBookLists = async () => {
  try {
    const data = await booklistAPI.getBookListsByStatus(activeTab.value)
    bookList.value = data
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const loadTags = async () => {
  try {
    allTags.value = await booklistAPI.getTags()
  } catch (error) {
    console.error('加载标签失败')
  }
}

const handleTabChange = () => {
  loadBookLists()
}

const openAddDialog = () => {
  isEdit.value = false
  isbnInput.value = ''
  selectedTags.value = []
  form.value = {
    book: {},
    status: 'WISHLIST',
    tags: []
  }
  dialogVisible.value = true
}

const searchIsbn = async () => {
  if (!isbnInput.value.trim()) {
    ElMessage.warning('请输入ISBN')
    return
  }
  try {
    const book = await booklistAPI.searchIsbn(isbnInput.value.trim())
    form.value.book = { ...book }
    ElMessage.success('搜索成功')
  } catch (error) {
    ElMessage.error('未找到该ISBN的书籍信息')
  }
}

const handleTagChange = (val) => {
  form.value.tags = val
}

const handleSubmit = async () => {
  if (!form.value.book.title) {
    ElMessage.warning('请输入书名')
    return
  }
  try {
    await booklistAPI.createBookList(form.value)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    loadBookLists()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const goToDetail = (id) => {
  router.push(`/book/${id}`)
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }
  return `${mins}分钟`
}

onMounted(() => {
  loadBookLists()
  loadTags()
})
</script>

<style scoped>
.bookshelf-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.bookshelf-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 0 24px;
  margin-bottom: 24px;
}

.book-grid {
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
  height: 320px;
  background: #f0f2f5;
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

.book-cover-placeholder {
  color: #c0c4cc;
}

.book-info {
  padding: 16px;
}

.book-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-tags {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.book-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reading-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.isbn-search {
  display: flex;
  gap: 8px;
  width: 100%;
}

.isbn-search .el-input {
  flex: 1;
}
</style>
