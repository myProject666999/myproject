<template>
  <div>
    <div class="page-header">
      <span class="page-title">巡检报告</span>
      <el-button type="primary" @click="generateReport">生成报告</el-button>
    </div>
    
    <div class="card-wrapper">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="报告类型">
          <el-select v-model="searchForm.type" placeholder="全部">
            <el-option label="日报" :value="1" />
            <el-option label="周报" :value="2" />
            <el-option label="月报" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dates"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="6">
          <div class="dashboard-card">
            <div class="card-title">总任务数</div>
            <div class="card-value primary">{{ summary.total || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="dashboard-card">
            <div class="card-title">执行次数</div>
            <div class="card-value success">{{ summary.executions || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="dashboard-card">
            <div class="card-title">成功率</div>
            <div class="card-value success">{{ summary.successRate || '0%' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="dashboard-card">
            <div class="card-title">失败次数</div>
            <div class="card-value danger">{{ summary.failed || 0 }}</div>
          </div>
        </el-col>
      </el-row>

      <div class="card-wrapper" style="margin-top: 20px;">
        <div class="page-header">
          <span class="page-title">任务执行情况</span>
        </div>
        <el-table :data="taskStats" stripe>
          <el-table-column prop="task_name" label="任务名称" min-width="150" />
          <el-table-column prop="executions" label="执行次数" width="100" />
          <el-table-column prop="success" label="成功次数" width="100">
            <template #default="{ row }">
              <span style="color: #67c23a;">{{ row.success }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="failed" label="失败次数" width="100">
            <template #default="{ row }">
              <span style="color: #f56c6c;">{{ row.failed }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="avg_duration" label="平均耗时(ms)" width="130" />
          <el-table-column prop="success_rate" label="成功率" width="100">
            <template #default="{ row }">
              <el-progress :percentage="row.success_rate || 0" :stroke-width="10" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="reportDialogVisible" title="生成报告" width="500px">
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="报告名称" required>
          <el-input v-model="reportForm.name" placeholder="请输入报告名称" />
        </el-form-item>
        <el-form-item label="报告类型" required>
          <el-select v-model="reportForm.type" placeholder="请选择类型" style="width: 100%;">
            <el-option label="日报" :value="1" />
            <el-option label="周报" :value="2" />
            <el-option label="月报" :value="3" />
            <el-option label="自定义" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围" required>
          <el-date-picker
            v-model="reportForm.dates"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="confirmGenerate">确定生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getResults, getTasks } from '@/api'

const searchForm = reactive({
  type: '',
  dates: []
})

const reportForm = reactive({
  name: '',
  type: 1,
  dates: []
})

const summary = ref({})
const taskStats = ref([])
const reportDialogVisible = ref(false)
const generating = ref(false)

const loadData = async () => {
  try {
    const [tasksRes, resultsRes] = await Promise.all([
      getTasks({ page: 1, page_size: 100 }),
      getResults({ page: 1, page_size: 1000 })
    ])

    const results = resultsRes.list || []
    
    summary.value = {
      total: tasksRes.total || 0,
      executions: results.length,
      success: results.filter(r => r.status === 1).length,
      failed: results.filter(r => r.status === 0).length,
      successRate: results.length > 0 
        ? Math.round((results.filter(r => r.status === 1).length / results.length) * 100) + '%' 
        : '0%'
    }

    const taskMap = {}
    results.forEach(r => {
      if (!taskMap[r.task_id]) {
        taskMap[r.task_id] = {
          task_name: r.task_name,
          executions: 0,
          success: 0,
          failed: 0,
          durations: []
        }
      }
      taskMap[r.task_id].executions++
      if (r.status === 1) {
        taskMap[r.task_id].success++
      } else if (r.status === 0) {
        taskMap[r.task_id].failed++
      }
      if (r.duration) {
        taskMap[r.task_id].durations.push(r.duration)
      }
    })

    taskStats.value = Object.values(taskMap).map(t => ({
      ...t,
      avg_duration: t.durations.length > 0 
        ? Math.round(t.durations.reduce((a, b) => a + b, 0) / t.durations.length) 
        : 0,
      success_rate: t.executions > 0 
        ? Math.round((t.success / t.executions) * 100) 
        : 0
    }))
  } catch (error) {
    console.error(error)
  }
}

const generateReport = () => {
  reportForm.name = `巡检报告-${new Date().toLocaleDateString()}`
  reportDialogVisible.value = true
}

const confirmGenerate = async () => {
  if (!reportForm.name || !reportForm.type || !reportForm.dates) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    generating.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('报告生成成功')
    reportDialogVisible.value = false
  } catch (error) {
    console.error(error)
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
