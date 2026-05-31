<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="dashboard-card">
          <div class="card-title">巡检任务总数</div>
          <div class="card-value primary">{{ stats.totalTasks || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="dashboard-card">
          <div class="card-title">今日执行次数</div>
          <div class="card-value success">{{ stats.todayExecutions || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="dashboard-card">
          <div class="card-title">成功次数</div>
          <div class="card-value success">{{ stats.successCount || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="dashboard-card">
          <div class="card-title">失败次数</div>
          <div class="card-value danger">{{ stats.failCount || 0 }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div class="card-wrapper">
          <div class="page-header">
            <span class="page-title">最近执行结果</span>
          </div>
          <el-table :data="recentResults" stripe>
            <el-table-column prop="task_name" label="任务名称" min-width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : row.status === 0 ? 'danger' : 'warning'" size="small">
                  {{ row.status === 1 ? '成功' : row.status === 0 ? '失败' : '执行中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="耗时(ms)" width="100" />
            <el-table-column prop="created_at" label="执行时间" width="180" />
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card-wrapper">
          <div class="page-header">
            <span class="page-title">快速执行预案</span>
          </div>
          <el-form :inline="true" :model="commandForm">
            <el-form-item label="选择预案">
              <el-select v-model="commandForm.command" placeholder="请选择预案" style="width: 200px;">
                <el-option v-for="plan in plans" :key="plan.id" :label="plan.name" :value="plan.command" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleExecuteCommand" :loading="executing">执行</el-button>
            </el-form-item>
          </el-form>
          <el-alert v-if="commandResult" :title="commandResult.success ? '执行成功' : '执行失败'" :type="commandResult.success ? 'success' : 'error'" style="margin-top: 15px;">
            <template #default>
              <pre>{{ JSON.stringify(commandResult, null, 2) }}</pre>
            </template>
          </el-alert>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTasks, getResults, getPlans, executeCommand as executeCommandApi } from '@/api'

const stats = ref({})
const recentResults = ref([])
const plans = ref([])
const commandForm = ref({
  command: ''
})
const executing = ref(false)
const commandResult = ref(null)

const loadStats = async () => {
  try {
    const [tasksRes, resultsRes] = await Promise.all([
      getTasks({ page: 1, page_size: 1 }),
      getResults({ page: 1, page_size: 10 })
    ])
    stats.value.totalTasks = tasksRes.total
    recentResults.value = resultsRes.list || []
    stats.value.todayExecutions = resultsRes.total
    stats.value.successCount = (resultsRes.list || []).filter(r => r.status === 1).length
    stats.value.failCount = (resultsRes.list || []).filter(r => r.status === 0).length
  } catch (error) {
    console.error(error)
  }
}

const loadPlans = async () => {
  try {
    const res = await getPlans({ page: 1, page_size: 100 })
    plans.value = res.list || []
  } catch (error) {
    console.error(error)
  }
}

const handleExecuteCommand = async () => {
  if (!commandForm.value.command) {
    ElMessage.warning('请选择预案')
    return
  }
  try {
    executing.value = true
    commandResult.value = null
    const res = await executeCommandApi({
      command: commandForm.value.command,
      params: {}
    })
    commandResult.value = res
    ElMessage.success('执行完成')
  } catch (error) {
    commandResult.value = { success: false, error: error.message }
  } finally {
    executing.value = false
  }
}

onMounted(() => {
  loadStats()
  loadPlans()
})
</script>
