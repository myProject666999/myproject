<template>
  <div class="page-container">
    <div class="page-header">
      <h2>骑手管理</h2>
      <el-button type="primary" @click="loadData">刷新</el-button>
    </div>

    <el-card style="margin-bottom: 20px">
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="正常" :value="1" />
            <el-option label="审核中" :value="2" />
            <el-option label="禁用" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="在线状态">
          <el-select v-model="filters.online_status" placeholder="全部" clearable style="width: 150px">
            <el-option label="离线" :value="0" />
            <el-option label="在线" :value="1" />
            <el-option label="接单中" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="riders" v-loading="loading" stripe>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="real_name" label="真实姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getRiderStatusTagType(row.status)">
              {{ riderStatusLabels[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.online_status > 0 ? 'success' : 'info'">
              {{ onlineStatusLabels[row.online_status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_count" label="总订单" width="80" />
        <el-table-column prop="complete_count" label="完成数" width="80" />
        <el-table-column prop="rating" label="评分" width="80">
          <template #default="{ row }">
            {{ row.rating?.toFixed(1) || '5.0' }}
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额(¥)" width="100">
          <template #default="{ row }">
            {{ row.balance?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="danger"
              size="small"
              @click="updateStatus(row.id, 3)"
            >
              禁用
            </el-button>
            <el-button
              v-else-if="row.status === 2"
              type="success"
              size="small"
              @click="updateStatus(row.id, 1)"
            >
              通过审核
            </el-button>
            <el-button
              v-else-if="row.status === 3"
              type="success"
              size="small"
              @click="updateStatus(row.id, 1)"
            >
              启用
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

const loading = ref(false)
const riders = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filters = reactive({
  status: undefined as number | undefined,
  online_status: undefined as number | undefined
})

const riderStatusLabels: Record<number, string> = {
  1: '正常',
  2: '审核中',
  3: '禁用'
}

const onlineStatusLabels: Record<number, string> = {
  0: '离线',
  1: '在线',
  2: '接单中'
}

function getRiderStatusTagType(status: number) {
  if (status === 1) return 'success'
  if (status === 2) return 'warning'
  return 'danger'
}

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

async function updateStatus(id: number, status: number) {
  const action = status === 1 ? '启用/通过' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}该骑手吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.put(`/admin/riders/${id}/status`, { status })
    ElMessage.success('操作成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
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
    if (filters.online_status !== undefined) {
      params.online_status = filters.online_status
    }

    const res = await request.get('/admin/riders', { params })
    riders.value = res.riders || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载骑手失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
