<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  List,
  Plus,
  UserCheck,
  Play,
  Package,
  XCircle,
  Search,
  RefreshCw,
  Eye
} from 'lucide-vue-next'
import StatusTag from '@/components/StatusTag.vue'
import TaskDetail from './TaskDetail.vue'
import {
  getReplenishmentList,
  generateTasks,
  dispatchTask,
  startTask,
  cancelTask
} from '@/api/replenishment'
import { getAllReplenishers } from '@/api/replenisher'
import type {
  ReplenishmentTask,
  ReplenishmentTaskQuery,
  ReplenishmentTaskDispatch,
  GenerateTaskRequest,
  Replenisher
} from '@/types'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const tasks = ref<ReplenishmentTask[]>([])
const replenishers = ref<Replenisher[]>([])
const total = ref(0)
const detailVisible = ref(false)
const dispatchVisible = ref(false)
const currentTask = ref<ReplenishmentTask | null>(null)
const dateRange = ref<[Date, Date] | null>(null)

const queryParams = reactive<ReplenishmentTaskQuery & { start_date?: string; end_date?: string }>({
  page: 1,
  page_size: 10,
  status: undefined,
  area: '',
  replenisher_id: undefined
})

const dispatchForm = reactive<ReplenishmentTaskDispatch>({
  replenisher_id: 0
})

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'default'

const taskStatusMap: Record<number, { label: string; type: StatusType }> = {
  0: { label: '待派发', type: 'pending' },
  1: { label: '已派发', type: 'info' },
  2: { label: '进行中', type: 'in-progress' },
  3: { label: '已完成', type: 'completed' },
  4: { label: '已取消', type: 'cancelled' }
}

const statusOptions = [
  { value: 0, label: '待派发' },
  { value: 1, label: '已派发' },
  { value: 2, label: '进行中' },
  { value: 3, label: '已完成' },
  { value: 4, label: '已取消' }
]

const areaOptions = [
  { value: 'A区', label: 'A区' },
  { value: 'B区', label: 'B区' },
  { value: 'C区', label: 'C区' },
  { value: 'D区', label: 'D区' }
]

const canDispatch = (task: ReplenishmentTask) => task.status === 0
const canStart = (task: ReplenishmentTask) => task.status === 1
const canExecute = (task: ReplenishmentTask) => task.status === 2
const canCancel = (task: ReplenishmentTask) => task.status === 0 || task.status === 1

const fetchTasks = async () => {
  loading.value = true
  try {
    const params = { ...queryParams }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString().split('T')[0]
      params.end_date = dateRange.value[1].toISOString().split('T')[0]
    }
    const res = await getReplenishmentList(params)
    tasks.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('获取任务列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchReplenishers = async () => {
  try {
    const res = await getAllReplenishers()
    replenishers.value = res.filter(r => r.status === 1)
  } catch (error) {
    console.error('获取补货员列表失败:', error)
  }
}

const handleGenerate = async () => {
  try {
    const data: GenerateTaskRequest = {}
    if (queryParams.area) {
      data.area = queryParams.area
    }
    await ElMessageBox.confirm(
      '确认生成补货任务？系统将根据库存预警自动生成任务。',
      '生成任务',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    const res = await generateTasks(data)
    ElMessage.success(`成功生成 ${res.length} 个任务`)
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('生成任务失败:', error)
    }
  }
}

const handleDispatch = (task: ReplenishmentTask) => {
  currentTask.value = task
  dispatchForm.replenisher_id = 0
  dispatchVisible.value = true
}

const confirmDispatch = async () => {
  if (!dispatchForm.replenisher_id) {
    ElMessage.warning('请选择补货员')
    return
  }
  if (!currentTask.value) return
  try {
    await dispatchTask(currentTask.value.id, dispatchForm)
    ElMessage.success('派发成功')
    dispatchVisible.value = false
    fetchTasks()
  } catch (error) {
    console.error('派发任务失败:', error)
  }
}

const handleStart = async (task: ReplenishmentTask) => {
  try {
    await ElMessageBox.confirm(
      `确认开始任务 ${task.task_no}？`,
      '开始任务',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await startTask(task.id)
    ElMessage.success('任务已开始')
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('开始任务失败:', error)
    }
  }
}

const handleViewDetail = (task: ReplenishmentTask) => {
  currentTask.value = task
  detailVisible.value = true
}

const handleCancel = async (task: ReplenishmentTask) => {
  try {
    await ElMessageBox.confirm(
      `确认取消任务 ${task.task_no}？此操作不可撤销。`,
      '取消任务',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await cancelTask(task.id)
    ElMessage.success('任务已取消')
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消任务失败:', error)
    }
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchTasks()
}

const handleReset = () => {
  queryParams.page = 1
  queryParams.status = undefined
  queryParams.area = ''
  queryParams.replenisher_id = undefined
  dateRange.value = null
  fetchTasks()
}

const handleSizeChange = (size: number) => {
  queryParams.page_size = size
  fetchTasks()
}

const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchTasks()
}

const getStatusInfo = (status: number): { label: string; type: StatusType } => {
  return taskStatusMap[status] || { label: '未知', type: 'default' }
}

onMounted(() => {
  fetchTasks()
  fetchReplenishers()
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <List class="w-6 h-6 text-primary" />
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">补货任务管理</h1>
      </div>
      <div class="flex gap-3">
        <ElButton type="primary" :icon="Plus" @click="handleGenerate">
          生成任务
        </ElButton>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-4">
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部状态"
            clearable
            class="w-40"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select
            v-model="queryParams.area"
            placeholder="全部区域"
            clearable
            class="w-40"
          >
            <el-option
              v-for="item in areaOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="补货员">
          <el-select
            v-model="queryParams.replenisher_id"
            placeholder="全部补货员"
            clearable
            class="w-40"
          >
            <el-option
              v-for="item in replenishers"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="w-64"
          />
        </el-form-item>
        <el-form-item>
          <ElButton type="primary" :icon="Search" @click="handleSearch">
            查询
          </ElButton>
          <ElButton :icon="RefreshCw" @click="handleReset">
            重置
          </ElButton>
        </el-form-item>
      </el-form>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <el-table
        v-loading="loading"
        :data="tasks"
        stripe
        style="width: 100%"
        class="dark:bg-gray-800"
      >
        <el-table-column prop="task_no" label="任务编号" min-width="160" />
        <el-table-column prop="area" label="区域" width="100" />
        <el-table-column prop="container_count" label="货柜数量" width="100" align="center" />
        <el-table-column prop="product_count" label="商品种类" width="100" align="center" />
        <el-table-column prop="total_quantity" label="补货总数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <StatusTag
              :status="getStatusInfo(row.status).type"
              :label="getStatusInfo(row.status).label"
            />
          </template>
        </el-table-column>
        <el-table-column prop="replenisher.name" label="补货员" width="100">
          <template #default="{ row }">
            {{ row.replenisher?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="280" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <ElButton
                size="small"
                :icon="Eye"
                @click="handleViewDetail(row)"
              >
                详情
              </ElButton>
              <ElButton
                v-if="canDispatch(row)"
                size="small"
                type="primary"
                :icon="UserCheck"
                @click="handleDispatch(row)"
              >
                派发
              </ElButton>
              <ElButton
                v-if="canStart(row)"
                size="small"
                type="success"
                :icon="Play"
                @click="handleStart(row)"
              >
                开始
              </ElButton>
              <ElButton
                v-if="canExecute(row)"
                size="small"
                type="warning"
                :icon="Package"
                @click="handleViewDetail(row)"
              >
                执行
              </ElButton>
              <ElButton
                v-if="canCancel(row)"
                size="small"
                type="danger"
                :icon="XCircle"
                @click="handleCancel(row)"
              >
                取消
              </ElButton>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="p-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dispatchVisible"
      title="派发任务"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="dispatchForm" label-width="80px">
        <el-form-item label="任务编号">
          <span class="text-gray-600 dark:text-gray-300">{{ currentTask?.task_no }}</span>
        </el-form-item>
        <el-form-item label="区域">
          <span class="text-gray-600 dark:text-gray-300">{{ currentTask?.area }}</span>
        </el-form-item>
        <el-form-item label="补货员" required>
          <el-select
            v-model="dispatchForm.replenisher_id"
            placeholder="请选择补货员"
            class="w-full"
          >
            <el-option
              v-for="item in replenishers.filter(r => r.area === currentTask?.area || !currentTask?.area)"
              :key="item.id"
              :label="`${item.name} (${item.area})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <ElButton @click="dispatchVisible = false">取消</ElButton>
        <ElButton type="primary" @click="confirmDispatch">确认派发</ElButton>
      </template>
    </el-dialog>

    <TaskDetail
      v-if="detailVisible && currentTask"
      v-model="detailVisible"
      :task-id="currentTask.id"
      @refresh="fetchTasks"
    />
  </div>
</template>
