<template>
  <div class="admin-page" v-loading="loading">
    <el-card class="filter-card" shadow="never">
      <div class="filter-bar">
        <span class="filter-label">状态：</span>
        <el-select
          v-model="statusFilter"
          placeholder="全部"
          clearable
          style="width: 180px"
          @change="loadList"
        >
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-button :icon="Refresh" @click="loadList">刷新</el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never" style="margin-top: 16px">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#409EFF"><Setting /></el-icon>
          <span>投诉管理</span>
          <span class="count">共 {{ list.length }} 条</span>
        </div>
      </template>

      <el-table
        :data="list"
        stripe
        style="width: 100%"
        highlight-current-row
        @row-click="goDetail"
        empty-text="暂无数据"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="110" />
        <el-table-column prop="area" label="区域" width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="light">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click.stop="openHandle(row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="处理投诉"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        v-if="currentRow"
        :model="handleForm"
        :rules="handleRules"
        ref="handleFormRef"
        label-width="100px"
      >
        <el-form-item label="标题">
          <span>{{ currentRow.title }}</span>
        </el-form-item>
        <el-form-item label="新状态" prop="status">
          <el-select v-model="handleForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="opt in handleStatusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明" prop="description">
          <el-input
            v-model="handleForm.description"
            type="textarea"
            :rows="4"
            placeholder="请填写处理说明"
          />
        </el-form-item>
        <el-form-item label="处理人" prop="handler">
          <el-input v-model="handleForm.handler" placeholder="请输入处理人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitHandle">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getAllComplaints, updateComplaintStatus } from '../api'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const list = ref([])
const statusFilter = ref('')
const dialogVisible = ref(false)
const currentRow = ref(null)
const handleFormRef = ref(null)

const statusOptions = [
  { label: '待受理', value: 'PENDING' },
  { label: '已受理', value: 'ACCEPTED' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已回复', value: 'REPLIED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已驳回', value: 'REJECTED' }
]

const handleStatusOptions = [
  { label: '待受理', value: 'PENDING' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已回复', value: 'REPLIED' },
  { label: '已完成', value: 'COMPLETED' }
]

const handleForm = reactive({
  status: '',
  description: '',
  handler: ''
})

const handleRules = {
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  description: [{ required: true, message: '请填写处理说明', trigger: 'blur' }],
  handler: [{ required: true, message: '请输入处理人', trigger: 'blur' }]
}

const statusType = (s) => {
  const map = {
    PENDING: 'info',
    ACCEPTED: '',
    PROCESSING: 'warning',
    REPLIED: 'primary',
    COMPLETED: 'success',
    REJECTED: 'danger'
  }
  return map[s] || 'info'
}

const statusText = (s) => {
  const map = {
    PENDING: '待受理',
    ACCEPTED: '已受理',
    PROCESSING: '处理中',
    REPLIED: '已回复',
    COMPLETED: '已完成',
    REJECTED: '已驳回'
  }
  return map[s] || s
}

const loadList = async () => {
  loading.value = true
  try {
    const data = await getAllComplaints(statusFilter.value || undefined)
    list.value = Array.isArray(data) ? data : []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

const goDetail = (row) => {
  router.push(`/detail/${row.id}`)
}

const openHandle = (row) => {
  currentRow.value = row
  handleForm.status = row.status
  handleForm.description = ''
  handleForm.handler = ''
  dialogVisible.value = true
}

const submitHandle = async () => {
  if (!handleFormRef.value) return
  await handleFormRef.value.validate(async (valid) => {
    if (!valid || !currentRow.value) return
    submitting.value = true
    try {
      await updateComplaintStatus(currentRow.value.id, {
        status: handleForm.status,
        description: handleForm.description,
        handler: handleForm.handler
      })
      ElMessage.success('处理成功')
      dialogVisible.value = false
      loadList()
    } catch (e) {
      // handled
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.admin-page {
  max-width: 1300px;
  margin: 0 auto;
}

.filter-card,
.table-card {
  border-radius: 8px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  color: #606266;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.count {
  font-size: 13px;
  color: #909399;
  font-weight: normal;
  margin-left: auto;
}
</style>
