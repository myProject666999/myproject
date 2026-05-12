<template>
  <div class="page-container">
    <div class="page-header">
      <h2>异常工单</h2>
      <el-button type="primary" @click="loadData">刷新</el-button>
    </div>

    <el-card style="margin-bottom: 20px">
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="待处理" :value="0" />
            <el-option label="处理中" :value="1" />
            <el-option label="已解决" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.type" placeholder="全部" clearable style="width: 150px">
            <el-option label="丢件" :value="1" />
            <el-option label="超时" :value="2" />
            <el-option label="损坏" :value="3" />
            <el-option label="其他" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="exceptions" v-loading="loading" stripe>
        <el-table-column prop="order.order_no" label="订单号" width="180">
          <template #default="{ row }">
            {{ row.order?.order_no || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="异常类型" width="100">
          <template #default="{ row }">
            {{ typeLabels[row.type] || '其他' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', getStatusClass(row.status)]">
              {{ statusLabels[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="compensation" label="赔偿金额(¥)" width="120">
          <template #default="{ row }">
            {{ row.compensation ? row.compensation.toFixed(2) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0 || row.status === 1"
              type="primary"
              size="small"
              @click="openHandleDialog(row)"
            >
              处理
            </el-button>
            <el-button
              v-else
              type="info"
              size="small"
              @click="openDetailDialog(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; text-align: right"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog
      v-model="handleDialogVisible"
      title="处理异常工单"
      width="500px"
    >
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="handleForm.status">
            <el-radio :value="2">已解决</el-radio>
            <el-radio :value="3">已驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input
            v-model="handleForm.handle_result"
            type="textarea"
            rows="3"
            placeholder="请输入处理说明"
          />
        </el-form-item>
        <el-form-item v-if="handleForm.status === 2" label="赔偿金额">
          <el-input-number
            v-model="handleForm.compensation"
            :min="0"
            :precision="2"
            :step="10"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleException" :loading="handleLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      title="异常工单详情"
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单号">
          {{ currentException?.order?.order_no || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="异常类型">
          {{ typeLabels[currentException?.type || 0] || '其他' }}
        </el-descriptions-item>
        <el-descriptions-item label="问题描述">
          {{ currentException?.description }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <span :class="['status-tag', getStatusClass(currentException?.status || 0)]">
            {{ statusLabels[currentException?.status || 0] }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="处理结果" v-if="currentException?.handle_result">
          {{ currentException?.handle_result }}
        </el-descriptions-item>
        <el-descriptions-item label="赔偿金额" v-if="currentException?.compensation">
          ¥{{ currentException?.compensation?.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatTime(currentException?.created_at) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const loading = ref(false)
const exceptions = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filters = reactive({
  status: undefined as number | undefined,
  type: undefined as number | undefined
})

const handleDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const handleLoading = ref(false)
const currentException = ref<any>(null)

const handleForm = reactive({
  id: 0,
  status: 2,
  handle_result: '',
  compensation: 0
})

const typeLabels: Record<number, string> = {
  1: '丢件',
  2: '超时',
  3: '损坏',
  4: '其他'
}

const statusLabels: Record<number, string> = {
  0: '待处理',
  1: '处理中',
  2: '已解决',
  3: '已驳回'
}

function getStatusClass(status: number) {
  if (status === 0) return 'status-pending'
  if (status === 1) return 'status-accepted'
  if (status === 2) return 'status-completed'
  return 'status-cancelled'
}

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

function openHandleDialog(row: any) {
  currentException.value = row
  handleForm.id = row.id
  handleForm.status = 2
  handleForm.handle_result = ''
  handleForm.compensation = 0
  handleDialogVisible.value = true
}

function openDetailDialog(row: any) {
  currentException.value = row
  detailDialogVisible.value = true
}

async function handleException() {
  if (!handleForm.handle_result) {
    ElMessage.warning('请输入处理说明')
    return
  }

  handleLoading.value = true
  try {
    await request.put(`/admin/exception/${handleForm.id}/handle`, {
      handle_result: handleForm.handle_result,
      compensation: handleForm.compensation,
      status: handleForm.status
    })
    ElMessage.success('处理成功')
    handleDialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '处理失败')
  } finally {
    handleLoading.value = false
  }
}

async function loadData() {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize.value
    }
    if (filters.status !== undefined) {
      params.status = filters.status
    }
    if (filters.type !== undefined) {
      params.type = filters.type
    }

    const res = await request.get('/admin/exception', { params })
    exceptions.value = res.exceptions || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载异常工单失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
