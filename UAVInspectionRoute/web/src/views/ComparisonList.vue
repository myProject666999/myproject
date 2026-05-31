<template>
  <div class="page-container">
    <div class="table-toolbar">
      <span style="font-size: 16px; font-weight: 600">历史对比</span>
      <el-button type="primary" @click="openCompareDialog"><el-icon><DataAnalysis /></el-icon>新建对比</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="baseTaskTitle" label="基准任务" min-width="140" />
      <el-table-column prop="compareTaskTitle" label="对比任务" min-width="140" />
      <el-table-column prop="similarityScore" label="相似度" width="100">
        <template #default="{ row }">
          <span :style="{ color: getScoreColor(row.similarityScore) }">{{ row.similarityScore != null ? (row.similarityScore * 100).toFixed(1) + '%' : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openDetail(row)">查看详情</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      style="margin-top: 16px; justify-content: flex-end"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadList"
    />

    <el-dialog v-model="compareDialogVisible" title="新建对比" width="520px" destroy-on-close>
      <el-form ref="compareFormRef" :model="compareForm" :rules="compareRules" label-width="90px">
        <el-form-item label="基准任务" prop="baseTaskId">
          <el-select v-model="compareForm.baseTaskId" placeholder="选择基准任务" style="width: 100%">
            <el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比任务" prop="compareTaskId">
          <el-select v-model="compareForm.compareTaskId" placeholder="选择对比任务" style="width: 100%">
            <el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="compareDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="comparing" @click="handleCompare">开始对比</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="对比详情" width="900px" destroy-on-close>
      <div v-if="detailData" class="comparison-detail">
        <div class="comparison-header">
          <div class="comparison-task">
            <span class="task-label">基准任务</span>
            <span>{{ detailData.baseTaskTitle }}</span>
          </div>
          <el-icon size="24" color="#409eff"><Right /></el-icon>
          <div class="comparison-task">
            <span class="task-label">对比任务</span>
            <span>{{ detailData.compareTaskTitle }}</span>
          </div>
          <div class="score-area">
            <div class="score-circle" :style="{ borderColor: getScoreColor(detailData.similarityScore) }">
              <span class="score-num" :style="{ color: getScoreColor(detailData.similarityScore) }">
                {{ detailData.similarityScore != null ? (detailData.similarityScore * 100).toFixed(1) : '-' }}
              </span>
              <span class="score-unit">相似度</span>
            </div>
          </div>
        </div>

        <div class="comparison-summary">
          <div class="summary-card new">
            <div class="summary-num">{{ detailData.newIssues || 0 }}</div>
            <div class="summary-label">新增问题</div>
          </div>
          <div class="summary-card resolved">
            <div class="summary-num">{{ detailData.resolvedIssues || 0 }}</div>
            <div class="summary-label">已解决问题</div>
          </div>
          <div class="summary-card changed">
            <div class="summary-num">{{ detailData.changedIssues || 0 }}</div>
            <div class="summary-label">变化问题</div>
          </div>
          <div class="summary-card unchanged">
            <div class="summary-num">{{ detailData.unchangedIssues || 0 }}</div>
            <div class="summary-label">未变化</div>
          </div>
        </div>

        <div v-if="detailData.newIssueList && detailData.newIssueList.length > 0" class="comparison-section">
          <h4>新增问题</h4>
          <el-table :data="detailData.newIssueList" size="small" border>
            <el-table-column prop="title" label="标题" min-width="120" />
            <el-table-column prop="category" label="类别" width="90">
              <template #default="{ row }">{{ categoryLabelMap[row.category] || row.category }}</template>
            </el-table-column>
            <el-table-column prop="severity" label="严重程度" width="90">
              <template #default="{ row }">
                <el-tag :type="severityTagMap[row.severity] || 'info'" size="small">{{ severityLabelMap[row.severity] || row.severity }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="detailData.resolvedIssueList && detailData.resolvedIssueList.length > 0" class="comparison-section">
          <h4>已解决问题</h4>
          <el-table :data="detailData.resolvedIssueList" size="small" border>
            <el-table-column prop="title" label="标题" min-width="120" />
            <el-table-column prop="category" label="类别" width="90">
              <template #default="{ row }">{{ categoryLabelMap[row.category] || row.category }}</template>
            </el-table-column>
            <el-table-column prop="severity" label="原严重程度" width="100">
              <template #default="{ row }">
                <el-tag :type="severityTagMap[row.severity] || 'info'" size="small">{{ severityLabelMap[row.severity] || row.severity }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="detailData.changedIssueList && detailData.changedIssueList.length > 0" class="comparison-section">
          <h4>变化问题</h4>
          <el-table :data="detailData.changedIssueList" size="small" border>
            <el-table-column prop="title" label="标题" min-width="120" />
            <el-table-column label="原严重程度" width="100">
              <template #default="{ row }">
                <el-tag :type="severityTagMap[row.oldSeverity] || 'info'" size="small">{{ severityLabelMap[row.oldSeverity] || row.oldSeverity }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="现严重程度" width="100">
              <template #default="{ row }">
                <el-tag :type="severityTagMap[row.newSeverity] || 'info'" size="small">{{ severityLabelMap[row.newSeverity] || row.newSeverity }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getComparisonList, getComparison, createComparison, deleteComparison, runComparison } from '../api/comparison'
import { getTaskList } from '../api/task'

const severityTagMap = { low: 'info', medium: '', high: 'warning', critical: 'danger' }
const severityLabelMap = { low: '低', medium: '中', high: '高', critical: '严重' }
const categoryLabelMap = { crack: '裂纹', rust: '锈蚀', deformation: '变形', missing: '缺失', foreign_object: '异物', other: '其他' }

const loading = ref(false)
const comparing = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const taskList = ref([])

const compareDialogVisible = ref(false)
const compareFormRef = ref(null)
const compareForm = reactive({ baseTaskId: null, compareTaskId: null })
const compareRules = {
  baseTaskId: [{ required: true, message: '请选择基准任务', trigger: 'change' }],
  compareTaskId: [{ required: true, message: '请选择对比任务', trigger: 'change' }]
}

const detailVisible = ref(false)
const detailData = ref(null)

function getScoreColor(score) {
  if (score == null) return '#909399'
  if (score >= 0.8) return '#67c23a'
  if (score >= 0.5) return '#e6a23c'
  return '#f56c6c'
}

async function loadList() {
  loading.value = true
  try {
    const res = await getComparisonList({ page: page.value, pageSize: pageSize.value })
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

async function loadTaskList() {
  try {
    const res = await getTaskList({ pageSize: 100, status: 'completed' })
    taskList.value = res.data.list || res.data || []
  } catch {}
}

function openCompareDialog() {
  Object.assign(compareForm, { baseTaskId: null, compareTaskId: null })
  compareDialogVisible.value = true
  loadTaskList()
}

async function handleCompare() {
  const valid = await compareFormRef.value.validate().catch(() => false)
  if (!valid) return
  if (compareForm.baseTaskId === compareForm.compareTaskId) {
    ElMessage.warning('基准任务和对比任务不能相同')
    return
  }
  comparing.value = true
  try {
    await runComparison({ ...compareForm })
    ElMessage.success('对比完成')
    compareDialogVisible.value = false
    loadList()
  } finally {
    comparing.value = false
  }
}

async function openDetail(row) {
  const res = await getComparison(row.id)
  detailData.value = res.data
  detailVisible.value = true
}

async function handleDelete(row) {
  await ElMessageBox.confirm('确定删除该对比记录？', '提示', { type: 'warning' })
  await deleteComparison(row.id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(() => loadList())
</script>

<style scoped>
.comparison-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 20px;
}

.comparison-task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.task-label {
  font-size: 12px;
  color: #909399;
}

.score-area {
  margin-left: 20px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #409eff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-num {
  font-size: 20px;
  font-weight: 700;
}

.score-unit {
  font-size: 11px;
  color: #909399;
}

.comparison-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.summary-card {
  text-align: center;
  padding: 16px;
  border-radius: 6px;
  background: #f5f7fa;
}

.summary-card .summary-num {
  font-size: 28px;
  font-weight: 700;
}

.summary-card.new .summary-num { color: #f56c6c; }
.summary-card.resolved .summary-num { color: #67c23a; }
.summary-card.changed .summary-num { color: #e6a23c; }
.summary-card.unchanged .summary-num { color: #909399; }

.summary-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.comparison-section {
  margin-bottom: 16px;
}

.comparison-section h4 {
  margin-bottom: 8px;
  font-size: 14px;
  color: #303133;
}
</style>
