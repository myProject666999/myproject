<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  X,
  Package,
  Clock,
  User,
  MapPin,
  Hash,
  Calendar,
  Save
} from 'lucide-vue-next'
import StatusTag from '@/components/StatusTag.vue'
import { getReplenishmentById, executeTask } from '@/api/replenishment'
import type {
  ReplenishmentTask,
  ReplenishmentTaskItem,
  ReplenishmentTaskExecute,
  ReplenishmentTaskItemExecute
} from '@/types'
import { formatDateTime } from '@/utils/format'

interface Props {
  modelValue: boolean
  taskId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}>()

const loading = ref(false)
const task = ref<ReplenishmentTask | null>(null)
const executeMode = ref(false)
const executeItems = reactive<Record<string, number>>({})

const taskStatusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待派发', type: 'pending' },
  1: { label: '已派发', type: 'info' },
  2: { label: '进行中', type: 'in-progress' },
  3: { label: '已完成', type: 'completed' },
  4: { label: '已取消', type: 'cancelled' }
}

const itemStatusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待补货', type: 'pending' },
  1: { label: '已补货', type: 'completed' }
}

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const timelineEvents = computed(() => {
  if (!task.value) return []
  const events = []
  events.push({
    color: '#10b981',
    title: '任务创建',
    time: formatDateTime(task.value.created_at),
    description: `任务 ${task.value.task_no} 已创建`,
    done: true
  })
  if (task.value.status >= 1 && task.value.replenisher) {
    events.push({
      color: '#3b82f6',
      title: '任务派发',
      time: formatDateTime(task.value.created_at),
      description: `已派发给补货员 ${task.value.replenisher.name}`,
      done: true
    })
  }
  if (task.value.status >= 2 && task.value.start_time) {
    events.push({
      color: '#8b5cf6',
      title: '开始执行',
      time: formatDateTime(task.value.start_time),
      description: '补货员开始执行任务',
      done: true
    })
  }
  if (task.value.status >= 3 && task.value.finish_time) {
    events.push({
      color: '#10b981',
      title: '任务完成',
      time: formatDateTime(task.value.finish_time),
      description: '任务已完成',
      done: true
    })
  }
  if (task.value.status === 4) {
    events.push({
      color: '#6b7280',
      title: '任务取消',
      time: formatDateTime(task.value.updated_at),
      description: '任务已取消',
      done: true
    })
  }
  return events
})

const progressPercent = computed(() => {
  if (!task.value?.items || task.value.items.length === 0) return 0
  const completed = task.value.items.filter(item => item.status === 1).length
  return Math.round((completed / task.value.items.length) * 100)
})

const groupedItems = computed(() => {
  if (!task.value?.items) return []
  const groups: Record<string, ReplenishmentTaskItem[]> = {}
  for (const item of task.value.items) {
    const key = item.container?.container_no || 'unknown'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  }
  return Object.entries(groups).map(([containerNo, items]) => ({
    containerNo,
    containerName: items[0]?.container?.name || '',
    items
  }))
})

const fetchTaskDetail = async () => {
  loading.value = true
  try {
    task.value = await getReplenishmentById(props.taskId)
    initExecuteItems()
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  } finally {
    loading.value = false
  }
}

const initExecuteItems = () => {
  Object.keys(executeItems).forEach(key => delete executeItems[key])
  if (task.value?.items) {
    for (const item of task.value.items) {
      const key = `${item.container_id}-${item.product_id}`
      executeItems[key] = item.planned_quantity
    }
  }
}

const getStatusInfo = (status: number) => {
  return taskStatusMap[status] || { label: '未知', type: 'default' }
}

const getItemStatusInfo = (status: number) => {
  return itemStatusMap[status] || { label: '未知', type: 'default' }
}

const toggleExecuteMode = () => {
  if (!executeMode.value) {
    initExecuteItems()
  }
  executeMode.value = !executeMode.value
}



const handleExecute = async () => {
  if (!task.value) return
  try {
    await ElMessageBox.confirm(
      '确认提交执行结果？提交后将更新库存信息。',
      '执行任务',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const items: ReplenishmentTaskItemExecute[] = []
    for (const item of task.value.items || []) {
      const key = `${item.container_id}-${item.product_id}`
      const actualQty = executeItems[key] ?? item.planned_quantity
      items.push({
        container_id: item.container_id,
        product_id: item.product_id,
        actual_quantity: actualQty
      })
    }
    const data: ReplenishmentTaskExecute = {
      task_id: task.value.id,
      items
    }
    await executeTask(data)
    ElMessage.success('任务执行成功')
    executeMode.value = false
    fetchTaskDetail()
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('执行任务失败:', error)
    }
  }
}

const handleClose = () => {
  visible.value = false
  task.value = null
  executeMode.value = false
}

watch(() => props.taskId, () => {
  if (props.taskId && visible.value) {
    fetchTaskDetail()
  }
}, { immediate: true })

watch(() => visible.value, (val) => {
  if (val && props.taskId) {
    fetchTaskDetail()
  }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="task ? `任务详情 - ${task.task_no}` : '任务详情'"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-lg font-semibold text-gray-800 dark:text-white">
          {{ task ? `任务详情 - ${task.task_no}` : '任务详情' }}
        </span>
        <button
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          @click="handleClose"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </template>

    <div v-loading="loading" class="space-y-6">
      <div v-if="task" class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Hash class="w-5 h-5 text-blue-500" />
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">任务编号</div>
            <div class="font-medium text-gray-800 dark:text-white">{{ task.task_no }}</div>
          </div>
        </div>
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <MapPin class="w-5 h-5 text-green-500" />
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">区域</div>
            <div class="font-medium text-gray-800 dark:text-white">{{ task.area }}</div>
          </div>
        </div>
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <User class="w-5 h-5 text-purple-500" />
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">补货员</div>
            <div class="font-medium text-gray-800 dark:text-white">
              {{ task.replenisher?.name || '-' }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <StatusTag
            :status="getStatusInfo(task.status).type as any"
            :label="getStatusInfo(task.status).label"
          />
        </div>
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Package class="w-5 h-5 text-orange-500" />
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">货柜/商品/数量</div>
            <div class="font-medium text-gray-800 dark:text-white">
              {{ task.container_count }} 个货柜 / {{ task.product_count }} 种商品 / {{ task.total_quantity }} 件
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Calendar class="w-5 h-5 text-cyan-500" />
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">创建时间</div>
            <div class="font-medium text-gray-800 dark:text-white">
              {{ formatDateTime(task.created_at) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="task && task.status === 2" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-blue-700 dark:text-blue-400">执行进度</span>
          <span class="text-sm font-bold text-blue-700 dark:text-blue-400">{{ progressPercent }}%</span>
        </div>
        <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5">
          <div
            class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <Clock class="w-5 h-5 text-gray-500" />
          任务进度
        </h3>
        <el-timeline>
          <el-timeline-item
            v-for="(event, index) in timelineEvents"
            :key="index"
            :color="event.color"
            :timestamp="event.time"
          >
            <h4 class="font-medium text-gray-800 dark:text-white">{{ event.title }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ event.description }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Package class="w-5 h-5 text-gray-500" />
            任务明细
          </h3>
          <div v-if="task && task.status === 2" class="flex gap-2">
            <ElButton
              v-if="!executeMode"
              type="primary"
              :icon="Package"
              @click="toggleExecuteMode"
            >
              开始执行
            </ElButton>
            <template v-else>
              <ElButton @click="toggleExecuteMode">取消</ElButton>
              <ElButton type="primary" :icon="Save" @click="handleExecute">
                提交执行结果
              </ElButton>
            </template>
          </div>
        </div>

        <div v-for="group in groupedItems" :key="group.containerNo" class="mb-6">
          <div class="flex items-center gap-2 mb-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Package class="w-4 h-4 text-gray-500" />
            <span class="font-medium text-gray-700 dark:text-gray-300">
              {{ group.containerNo }} - {{ group.containerName }}
            </span>
          </div>
          <el-table
            :data="group.items"
            stripe
            style="width: 100%"
            class="dark:bg-gray-800"
          >
            <el-table-column prop="product.product_code" label="商品编码" width="120">
              <template #default="{ row }">
                {{ row.product?.product_code }}
              </template>
            </el-table-column>
            <el-table-column prop="product.name" label="商品名称" min-width="150">
              <template #default="{ row }">
                {{ row.product?.name }}
              </template>
            </el-table-column>
            <el-table-column prop="planned_quantity" label="计划数量" width="100" align="center" />
            <el-table-column label="实际数量" width="140" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-if="executeMode && row.status === 0"
                  v-model="executeItems[`${row.container_id}-${row.product_id}`]"
                  :min="0"
                  :max="row.planned_quantity * 2"
                  size="small"
                />
                <span v-else :class="row.actual_quantity !== undefined ? 'text-gray-800 dark:text-white' : 'text-gray-400'">
                  {{ row.actual_quantity !== undefined ? row.actual_quantity : '-' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <StatusTag
                  :status="getItemStatusInfo(row.status).type as any"
                  :label="getItemStatusInfo(row.status).label"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton @click="handleClose">关闭</ElButton>
    </template>
  </el-dialog>
</template>
