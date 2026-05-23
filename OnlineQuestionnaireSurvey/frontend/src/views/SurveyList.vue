<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">问卷管理</h2>
      <el-button type="primary" @click="showCreateDialog" :icon="Plus">创建问卷</el-button>
    </div>
    
    <el-card class="card-shadow">
      <div class="filter-bar">
        <el-input v-model="searchKeyword" placeholder="搜索问卷标题" style="width: 240px" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px" clearable>
          <el-option label="草稿" :value="0" />
          <el-option label="已发布" :value="1" />
          <el-option label="已结束" :value="2" />
        </el-select>
      </div>
      
      <el-table :data="filteredSurveys" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="问卷标题" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="responseCount" label="填写数" width="100" />
        <el-table-column prop="viewCount" label="浏览数" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="goDesign(row.id)" :icon="Edit">设计</el-button>
            <el-button size="small" type="success" @click="showPublishDialog(row)" :icon="Promotion">
              {{ row.status === 1 ? '管理' : '发布' }}
            </el-button>
            <el-button size="small" type="primary" @click="goStatistics(row.id)" :icon="DataAnalysis">统计</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchSurveys"
          @current-change="fetchSurveys"
        />
      </div>
    </el-card>
    
    <el-dialog v-model="createDialogVisible" title="创建问卷" width="500px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef">
        <el-form-item label="问卷标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入问卷标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="问卷描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入问卷描述（选填）" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="publishDialogVisible" title="问卷发布" width="500px">
      <template v-if="currentSurvey">
        <div class="publish-info">
          <h3>{{ currentSurvey.title }}</h3>
          <div class="share-section">
            <p>填写链接：</p>
            <div class="link-row">
              <el-input :model-value="fillLink" readonly>
                <template #append>
                  <el-button @click="copyLink(fillLink)" :icon="CopyDocument">复制</el-button>
                </template>
              </el-input>
            </div>
            <div class="qrcode-section">
              <p>扫码填写：</p>
              <img :src="qrCodeUrl" alt="QR Code" class="qrcode-img" />
            </div>
          </div>
          <el-divider />
          <el-form :model="publishForm">
            <el-form-item label="开始时间">
              <el-date-picker v-model="publishForm.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker v-model="publishForm.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
            </el-form-item>
            <el-form-item label="最大填写数">
              <el-input-number v-model="publishForm.maxResponses" :min="-1" :max="100000" />
              <span style="margin-left: 10px; color: #909399;">-1 表示无限制</span>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="publishing" @click="handlePublish">
          {{ currentSurvey?.status === 1 ? '保存设置' : '发布问卷' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Promotion, DataAnalysis, Delete, Search, CopyDocument } from '@element-plus/icons-vue'
import { getSurveyList, createSurvey, updateSurvey, deleteSurvey, publishSurvey } from '@/api/survey'

const router = useRouter()
const loading = ref(false)
const creating = ref(false)
const publishing = ref(false)
const surveys = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const statusFilter = ref(null)
const createDialogVisible = ref(false)
const publishDialogVisible = ref(false)
const currentSurvey = ref(null)
const qrCodeUrl = ref('')
const createFormRef = ref(null)

const createForm = reactive({
  title: '',
  description: ''
})

const createRules = {
  title: [{ required: true, message: '请输入问卷标题', trigger: 'blur' }]
}

const publishForm = reactive({
  startTime: null,
  endTime: null,
  maxResponses: -1
})

const fillLink = computed(() => {
  if (currentSurvey.value) {
    return `${window.location.origin}/survey/fill/${currentSurvey.value.id}`
  }
  return ''
})

const filteredSurveys = computed(() => {
  return surveys.value.filter(s => {
    const matchKeyword = !searchKeyword.value || s.title.includes(searchKeyword.value)
    const matchStatus = statusFilter.value === null || s.status === statusFilter.value
    return matchKeyword && matchStatus
  })
})

function getStatusType(status) {
  const map = { 0: 'info', 1: 'success', 2: 'warning' }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = { 0: '草稿', 1: '已发布', 2: '已结束' }
  return map[status] || '未知'
}

async function fetchSurveys() {
  loading.value = true
  try {
    const res = await getSurveyList({ current: page.value, size: pageSize.value })
    surveys.value = res.data.records || res.data || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function showCreateDialog() {
  createForm.title = ''
  createForm.description = ''
  createDialogVisible.value = true
}

async function handleCreate() {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        creating.value = true
        const res = await createSurvey(createForm)
        ElMessage.success('创建成功')
        createDialogVisible.value = false
        router.push(`/surveys/design/${res.data.id}`)
      } finally {
        creating.value = false
      }
    }
  })
}

function goDesign(id) {
  router.push(`/surveys/design/${id}`)
}

function goStatistics(id) {
  router.push(`/surveys/statistics/${id}`)
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除问卷"${row.title}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteSurvey(row.id)
    ElMessage.success('删除成功')
    fetchSurveys()
  } catch (e) {
    if (e !== 'cancel') {
      // error handled
    }
  }
}

function showPublishDialog(row) {
  currentSurvey.value = row
  publishForm.startTime = row.startTime || null
  publishForm.endTime = row.endTime || null
  publishForm.maxResponses = row.maxResponses || -1
  generateQRCode()
  publishDialogVisible.value = true
}

function generateQRCode() {
  if (fillLink.value) {
    qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fillLink.value)}`
  }
}

function copyLink(text) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('链接已复制')
  })
}

async function handlePublish() {
  if (!currentSurvey.value) return
  try {
    publishing.value = true
    await publishSurvey(currentSurvey.value.id, {
      surveyId: currentSurvey.value.id,
      status: 1,
      ...publishForm
    })
    ElMessage.success('发布成功')
    publishDialogVisible.value = false
    fetchSurveys()
  } finally {
    publishing.value = false
  }
}

onMounted(fetchSurveys)
</script>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.publish-info {
  h3 {
    margin-bottom: 20px;
    color: #303133;
  }
  .share-section {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    p {
      margin-bottom: 8px;
      color: #606266;
    }
    .link-row {
      margin-bottom: 16px;
    }
    .qrcode-section {
      text-align: center;
      .qrcode-img {
        width: 150px;
        height: 150px;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
      }
    }
  }
}
</style>
