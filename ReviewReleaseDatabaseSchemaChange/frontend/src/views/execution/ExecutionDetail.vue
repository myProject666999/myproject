<template>
  <div class="execution-detail">
    <el-page-header @back="$router.back()" content="执行详情" />

    <el-card class="card-section" style="margin-top: 20px;">
      <template #header>
        <span class="section-title">执行状态</span>
        <el-tag :class="'status-tag ' + executionRecord.status" size="large" style="float: right;">
          {{ getStatusText(executionRecord.status) }}
        </el-tag>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="执行编号">{{ executionRecord.id }}</el-descriptions-item>
        <el-descriptions-item label="执行类型">{{ getExecutionTypeText(executionRecord.executionType) }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ executionRecord.executorName }}</el-descriptions-item>
        <el-descriptions-item label="批次">{{ executionRecord.batchNumber }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ executionRecord.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ executionRecord.endTime }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="card-section">
      <template #header><span class="section-title">执行控制</span></template>
      <div class="control-buttons">
        <el-button type="primary" :disabled="!canPause" @click="handlePause">
          <el-icon><VideoPause /></el-icon>
          暂停执行
        </el-button>
        <el-button type="success" :disabled="!canResume" @click="handleResume">
          <el-icon><VideoPlay /></el-icon>
          恢复执行
        </el-button>
        <el-button type="danger" :disabled="!canStop" @click="handleStop">
          <el-icon><VideoStop /></el-icon>
          中止执行
        </el-button>
        <el-button type="warning" @click="handleRollback">
          <el-icon><RefreshLeft /></el-icon>
          执行回滚
        </el-button>
      </div>
    </el-card>

    <el-card class="card-section">
      <template #header><span class="section-title">执行日志</span></template>
      <div class="log-container">
        <pre>{{ executionRecord.executeLog || '暂无日志...' }}</pre>
      </div>
      <div v-if="executionRecord.errorMessage" class="error-message">
        <el-alert :title="executionRecord.errorMessage" type="error" :closable="false" />
      </div>
    </el-card>

    <el-card class="card-section">
      <template #header><span class="section-title">执行进度</span></template>
      <el-progress :percentage="progressPercent" :status="progressStatus" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExecutionRecord, pauseExecution, resumeExecution, stopExecution, rollback } from '@/api/execution'

const route = useRoute()

const executionRecord = ref({})
let timer = null

const getStatusText = (status) => {
  const map = {
    pending: '待执行',
    executing: '执行中',
    success: '执行成功',
    failed: '执行失败',
    stopped: '已中止',
    rollback: '回滚中'
  }
  return map[status] || status
}

const getExecutionTypeText = (type) => {
  const map = {
    execute: '正常执行',
    rollback: '回滚执行',
    retry: '重试执行'
  }
  return map[type] || type
}

const canPause = computed(() => executionRecord.value.status === 'executing' && executionRecord.value.isPaused === 0)
const canResume = computed(() => executionRecord.value.status === 'executing' && executionRecord.value.isPaused === 1)
const canStop = computed(() => executionRecord.value.status === 'executing')

const progressPercent = computed(() => {
  return 50
})

const progressStatus = computed(() => {
  const s = executionRecord.value.status
  if (s === 'success') return 'success'
  if (s === 'failed' || s === 'stopped') return 'exception'
  return null
})

const loadData = async () => {
  try {
    const res = await getExecutionRecord(route.params.id)
    executionRecord.value = res.data || {}
  } catch (e) {
    console.error(e)
  }
}

const handlePause = async () => {
  try {
    await pauseExecution(route.params.id)
    ElMessage.success('已暂停')
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const handleResume = async () => {
  try {
    await resumeExecution(route.params.id)
    ElMessage.success('已恢复')
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const handleStop = async () => {
  try {
    await ElMessageBox.confirm('确定要中止执行吗？中止后已执行的SQL不会回滚。', '确认中止', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await stopExecution(route.params.id)
    ElMessage.success('已中止')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const handleRollback = async () => {
  try {
    await ElMessageBox.confirm('确定要执行回滚吗？请确认回滚SQL已准备好。', '确认回滚', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await rollback(executionRecord.value.orderId)
    ElMessage.success('回滚任务已启动')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

onMounted(() => {
  loadData()
  timer = setInterval(() => {
    if (executionRecord.value.status === 'executing') {
      loadData()
    }
  }, 3000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.control-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 20px 0;
}

.log-container {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  white-space: pre-wrap;
}

.error-message {
  margin-top: 15px;
}
</style>
