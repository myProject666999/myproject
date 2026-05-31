<template>
  <div class="author-dashboard">
    <h2 class="author-dashboard__title">作者管理中心</h2>

    <el-tabs v-model="activeTab" class="author-dashboard__tabs">
      <el-tab-pane label="我的专栏" name="columns">
        <div class="author-dashboard__toolbar">
          <el-button type="primary" :icon="Plus" @click="openColumnDialog()">
            创建专栏
          </el-button>
        </div>

        <el-table v-loading="columnsLoading" :data="columns" stripe style="width: 100%">
          <el-table-column prop="title" label="专栏标题" min-width="200" />
          <el-table-column prop="subscriber_count" label="订阅人数" width="120" />
          <el-table-column label="收入" width="150">
            <template #default="{ row }">
              <span class="author-dashboard__revenue">
                ¥{{ (row.revenue || 0).toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openColumnDialog(row)">
                编辑
              </el-button>
              <el-button link type="danger" :icon="Delete" @click="handleDeleteColumn(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!columnsLoading && columns.length === 0" description="暂无专栏" />
      </el-tab-pane>

      <el-tab-pane label="我的文章" name="articles">
        <el-table v-loading="articlesLoading" :data="articles" stripe style="width: 100%">
          <el-table-column prop="title" label="文章标题" min-width="200" />
          <el-table-column label="所属专栏" min-width="160">
            <template #default="{ row }">
              {{ row.column_title || row.column?.title || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="view_count" label="浏览量" width="100" />
          <el-table-column prop="like_count" label="点赞数" width="100" />
          <el-table-column prop="comment_count" label="评论数" width="100" />
          <el-table-column label="免费" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.is_free" type="success" size="small">免费</el-tag>
              <el-tag v-else type="warning" size="small">付费</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openArticleDialog(row)">
                编辑
              </el-button>
              <el-button link type="danger" :icon="Delete" @click="handleDeleteArticle(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!articlesLoading && articles.length === 0" description="暂无文章" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="columnDialogVisible"
      :title="editingColumn ? '编辑专栏' : '创建专栏'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="columnFormRef"
        :model="columnFormData"
        :rules="columnFormRules"
        label-width="100px"
      >
        <el-form-item label="专栏标题" prop="title">
          <el-input v-model="columnFormData.title" placeholder="请输入专栏标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="专栏描述" prop="description">
          <el-input
            v-model="columnFormData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入专栏描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="封面图片" prop="cover_image">
          <el-input v-model="columnFormData.cover_image" placeholder="请输入封面图片 URL" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="columnFormData.price"
            :min="0"
            :precision="2"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="是否免费">
          <el-switch v-model="columnFormData.is_free" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="columnDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="columnSubmitting" @click="handleSubmitColumn">
          {{ editingColumn ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="articleDialogVisible"
      :title="editingArticle ? '编辑文章' : '创建文章'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="articleFormRef"
        :model="articleFormData"
        :rules="articleFormRules"
        label-width="100px"
      >
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="articleFormData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="文章摘要" prop="summary">
          <el-input
            v-model="articleFormData.summary"
            type="textarea"
            :rows="2"
            placeholder="请输入文章摘要"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="试用内容" prop="trial_content">
          <el-input
            v-model="articleFormData.trial_content"
            type="textarea"
            :rows="3"
            placeholder="请输入试用内容（可选）"
          />
        </el-form-item>
        <el-form-item label="正文内容" prop="content">
          <el-input
            v-model="articleFormData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入正文内容（支持 Markdown）"
          />
        </el-form-item>
        <el-form-item label="是否免费">
          <el-switch v-model="articleFormData.is_free" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="articleSubmitting" @click="handleSubmitArticle">
          {{ editingArticle ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { columnApi, articleApi } from '../api'

const router = useRouter()

const activeTab = ref('columns')

const columns = ref([])
const columnsLoading = ref(false)
const articles = ref([])
const articlesLoading = ref(false)

const columnDialogVisible = ref(false)
const columnSubmitting = ref(false)
const columnFormRef = ref(null)
const editingColumn = ref(null)
const columnFormData = ref({
  title: '',
  description: '',
  cover_image: '',
  price: 0,
  is_free: false
})

const columnFormRules = {
  title: [
    { required: true, message: '请输入专栏标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入专栏描述', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ]
}

const articleDialogVisible = ref(false)
const articleSubmitting = ref(false)
const articleFormRef = ref(null)
const editingArticle = ref(null)
const articleFormData = ref({
  title: '',
  summary: '',
  trial_content: '',
  content: '',
  is_free: false
})

const articleFormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入文章摘要', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入正文内容', trigger: 'blur' }
  ]
}

async function loadColumns() {
  columnsLoading.value = true
  try {
    const data = await columnApi.getMy()
    columns.value = Array.isArray(data) ? data : (data.items || data.list || [])
  } catch (e) {
    console.error(e)
  } finally {
    columnsLoading.value = false
  }
}

async function loadArticles() {
  articlesLoading.value = true
  try {
    const data = await articleApi.getMy()
    articles.value = Array.isArray(data) ? data : (data.items || data.list || [])
  } catch (e) {
    console.error(e)
  } finally {
    articlesLoading.value = false
  }
}

function resetColumnForm() {
  editingColumn.value = null
  columnFormData.value = {
    title: '',
    description: '',
    cover_image: '',
    price: 0,
    is_free: false
  }
}

function openColumnDialog(row) {
  resetColumnForm()
  if (row) {
    editingColumn.value = row
    columnFormData.value = {
      title: row.title || '',
      description: row.description || '',
      cover_image: row.cover_image || '',
      price: row.price || 0,
      is_free: !!row.is_free
    }
  }
  columnDialogVisible.value = true
}

async function handleSubmitColumn() {
  if (!columnFormRef.value) return
  try {
    await columnFormRef.value.validate()
  } catch {
    return
  }

  columnSubmitting.value = true
  try {
    if (editingColumn.value) {
      await columnApi.update(editingColumn.value.id, columnFormData.value)
      ElMessage.success('专栏更新成功')
    } else {
      await columnApi.create(columnFormData.value)
      ElMessage.success('专栏创建成功')
    }
    columnDialogVisible.value = false
    resetColumnForm()
    loadColumns()
  } catch (e) {
    console.error(e)
  } finally {
    columnSubmitting.value = false
  }
}

async function handleDeleteColumn(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除专栏《${row.title}》？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  try {
    await columnApi.delete(row.id)
    ElMessage.success('专栏已删除')
    loadColumns()
  } catch (e) {
    console.error(e)
  }
}

function resetArticleForm() {
  editingArticle.value = null
  articleFormData.value = {
    title: '',
    summary: '',
    trial_content: '',
    content: '',
    is_free: false
  }
}

function openArticleDialog(row) {
  resetArticleForm()
  if (row) {
    editingArticle.value = row
    articleFormData.value = {
      title: row.title || '',
      summary: row.summary || '',
      trial_content: row.trial_content || '',
      content: row.content || '',
      is_free: !!row.is_free
    }
  }
  articleDialogVisible.value = true
}

async function handleSubmitArticle() {
  if (!articleFormRef.value) return
  try {
    await articleFormRef.value.validate()
  } catch {
    return
  }

  articleSubmitting.value = true
  try {
    if (editingArticle.value) {
      await articleApi.update(editingArticle.value.id, articleFormData.value)
      ElMessage.success('文章更新成功')
    } else {
      await articleApi.create(articleFormData.value)
      ElMessage.success('文章创建成功')
    }
    articleDialogVisible.value = false
    resetArticleForm()
    loadArticles()
  } catch (e) {
    console.error(e)
  } finally {
    articleSubmitting.value = false
  }
}

async function handleDeleteArticle(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除文章《${row.title}》？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  try {
    await articleApi.delete(row.id)
    ElMessage.success('文章已删除')
    loadArticles()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadColumns()
  loadArticles()
})
</script>

<style scoped>
.author-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.author-dashboard__title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--el-text-color-primary);
}

.author-dashboard__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.author-dashboard__revenue {
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
