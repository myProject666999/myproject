<template>
  <div class="column-list">
    <div class="column-list__header">
      <h2 class="column-list__title">全部专栏</h2>
      <div class="column-list__actions">
        <el-input
          v-model="keyword"
          placeholder="搜索专栏标题..."
          clearable
          class="column-list__search"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button v-if="userStore.isAuthor" type="primary" @click="dialogVisible = true">
          <el-icon><Plus /></el-icon>
          创建专栏
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="column-list__grid">
      <el-row :gutter="24">
        <el-col
          v-for="column in columns"
          :key="column.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card
            class="column-list__card"
            shadow="hover"
            @click="goColumnDetail(column.id)"
          >
            <div class="column-list__cover">
              <el-image
                :src="column.cover_image"
                fit="cover"
                class="column-list__image"
              >
                <template #error>
                  <div class="column-list__image-placeholder">
                    <el-icon :size="48"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <el-tag
                v-if="column.is_free"
                class="column-list__tag"
                type="success"
                effect="dark"
              >
                免费
              </el-tag>
              <el-tag
                v-else
                class="column-list__tag"
                type="warning"
                effect="dark"
              >
                付费
              </el-tag>
            </div>

            <div class="column-list__info">
              <h3 class="column-list__card-title">{{ column.title }}</h3>
              <p class="column-list__desc">{{ column.description }}</p>

              <div class="column-list__meta">
                <div class="column-list__author">
                  <el-avatar :size="24" :src="column.author?.avatar">
                    {{ (column.author?.username || 'A').charAt(0).toUpperCase() }}
                  </el-avatar>
                  <span class="column-list__author-name">
                    {{ column.author?.username || '未知作者' }}
                  </span>
                </div>
                <div class="column-list__stats">
                  <span class="column-list__price">
                    ¥{{ (column.price || 0).toFixed(2) }}
                  </span>
                  <span class="column-list__subscribers">
                    <el-icon><User /></el-icon>
                    {{ column.subscriber_count || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="!loading && columns.length === 0" description="暂无专栏" />
    </div>

    <div v-if="total > pageSize" class="column-list__pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="创建专栏"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="90px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入专栏标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入专栏描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="封面图片" prop="cover_image">
          <el-input v-model="formData.cover_image" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="是否免费">
          <el-switch v-model="formData.is_free" />
        </el-form-item>
        <el-form-item v-if="!formData.is_free" label="价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="1"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, Picture, User } from '@element-plus/icons-vue'
import { columnApi } from '../api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const columns = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const keyword = ref('')

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const formData = ref({
  title: '',
  description: '',
  cover_image: '',
  is_free: false,
  price: 0
})

const formRules = {
  title: [
    { required: true, message: '请输入专栏标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入专栏描述', trigger: 'blur' }
  ],
  cover_image: [
    { required: true, message: '请输入封面图片URL', trigger: 'blur' }
  ],
  price: [
    {
      validator: (_rule, value, callback) => {
        if (!formData.value.is_free && (value === null || value === undefined || value <= 0)) {
          callback(new Error('请输入有效的价格'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

async function loadColumns() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    const data = await columnApi.getList(params)
    columns.value = data.items || data.list || data.data || []
    total.value = data.total || columns.value.length
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadColumns()
}

function handlePageChange(val) {
  page.value = val
  loadColumns()
}

function goColumnDetail(id) {
  router.push(`/column/${id}`)
}

async function handleCreate() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const data = await columnApi.create(formData.value)
    ElMessage.success('专栏创建成功')
    dialogVisible.value = false
    formData.value = {
      title: '',
      description: '',
      cover_image: '',
      is_free: false,
      price: 0
    }
    if (formRef.value) {
      formRef.value.resetFields()
    }
    if (data?.id) {
      router.push(`/column/${data.id}`)
    } else {
      loadColumns()
    }
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadColumns()
})
</script>

<style scoped>
.column-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.column-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.column-list__title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.column-list__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.column-list__search {
  width: 280px;
}

.column-list__grid {
  min-height: 300px;
}

.column-list__card {
  cursor: pointer;
  margin-bottom: 24px;
  transition: transform 0.2s;
}

.column-list__card:hover {
  transform: translateY(-4px);
}

.column-list__cover {
  position: relative;
  margin: -20px -20px 0;
}

.column-list__image {
  width: 100%;
  height: 160px;
  display: block;
}

.column-list__image-placeholder {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.column-list__tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.column-list__info {
  padding-top: 16px;
}

.column-list__card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-list__desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  min-height: 39px;
}

.column-list__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-list__author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.column-list__author-name {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.column-list__stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.column-list__price {
  color: var(--el-color-danger);
  font-weight: 600;
}

.column-list__subscribers {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
}

.column-list__pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
