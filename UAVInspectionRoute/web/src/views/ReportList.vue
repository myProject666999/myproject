<template>
  <div class="page-container">
    <div class="table-toolbar">
      <el-select v-model="filterTaskId" placeholder="按任务筛选" clearable style="width: 200px" @change="loadList">
        <el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
      </el-select>
      <el-button type="primary" @click="openGenerateDialog"><el-icon><Document /></el-icon>生成报告</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="title" label="报告标题" min-width="160" />
      <el-table-column prop="taskTitle" label="关联任务" width="140" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="reportStatusTagMap[row.status] || 'info'" size="small">{{ reportStatusLabelMap[row.status] || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="生成时间" width="170" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openDetail(row)">查看</el-button>
          <el-button v-if="row.status === 'draft'" type="warning" link size="small" @click="handleReview(row)">审核</el-button>
          <el-button v-if="row.status === 'reviewed'" type="success" link size="small" @click="handlePublish(row)">发布</el-button>
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

    <el-dialog v-model="generateDialogVisible" title="生成巡检报告" width="480px" destroy-on-close>
      <el-form ref="genFormRef" :model="genForm" :rules="genRules" label-width="80px">
        <el-form-item label="报告标题" prop="title">
          <el-input v-model="genForm.title" placeholder="请输入报告标题" />
        </el-form-item>
        <el-form-item label="关联任务" prop="taskId">
          <el-select v-model="genForm.taskId" placeholder="选择任务" style="width: 100%">
            <el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="handleGenerate">生成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="报告详情" width="700px" destroy-on-close>
      <div v-if="detailData" class="report-detail">
        <h3 class="report-detail-title">{{ detailData.title }}</h3>
        <div class="report-meta">
          <span>关联任务：{{ detailData.taskTitle }}</span>
          <span>状态：<el-tag :type="reportStatusTagMap[detailData.status]" size="small">{{ reportStatusLabelMap[detailData.status] }}</el-tag></span>
          <span>生成时间：{{ detailData.createdAt }}</span>
        </div>

        <div v-if="detailData.statistics" class="report-stats">
          <h4>巡检统计</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ detailData.statistics.totalImages || 0 }}</div>
              <div class="stat-label">影像数量</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #e6a23c">{{ detailData.statistics.totalAnnotations || 0 }}</div>
              <div class="stat-label">问题标注</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #f56c6c">{{ detailData.statistics.criticalCount || 0 }}</div>
              <div class="stat-label">严重问题</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #67c23a">{{ detailData.statistics.resolvedCount || 0 }}</div>
              <div class="stat-label">已解决</div>
            </div>
          </div>
        </div>

        <div v-if="detailData.statistics?.severityDistribution" class="report-section">
          <h4>问题严重程度分布</h4>
          <div class="severity-bar">
            <div v-for="(count, key) in detailData.statistics.severityDistribution" :key="key" class="severity-bar-item" :style="{ flex: count }">
              <span class="bar-label">{{ severityLabelMap[key] || key }}: {{ count }}</span>
            </div>
          </div>
        </div>

        <div v-if="detailData.statistics?.categoryDistribution" class="report-section">
          <h4>问题类别分布</h4>
          <div class="category-list">
            <div v-for="(count, key) in detailData.statistics.categoryDistribution" :key="key" class="category-item">
              <span class="category-name">{{ categoryLabelMap[key] || key }}</span>
              <el-progress :percentage="Math.round(count / (detailData.statistics.totalAnnotations || 1) * 100)" :stroke-width="16" :text-inside="true" :format="() => count + ''" />
            </div>
          </div>
        </div>

        <div v-if="detailData.content" class="report-section">
          <h4>报告内容</h4>
          <div class="report-content">{{ detailData.content }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReportList, getReport, generateReport, updateReport, deleteReport } from '../api/report'
import { getTaskList } from '../api/task'

const reportStatusLabelMap = { draft: '草稿', reviewed: '已审核', published: '已发布' }
const reportStatusTagMap = { draft: 'info', reviewed: 'warning', published: 'success' }
const severityLabelMap = { low: '低', medium: '中', high: '高', critical: '严重' }
const categoryLabelMap = { crack: '裂纹', rust: '锈蚀', deformation: '变形', missing: '缺失', foreign_object: '异物', other: '其他' }

const loading = ref(false)
const generating = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const filterTaskId = ref('')
const taskList = ref([])

const generateDialogVisible = ref(false)
const genFormRef = ref(null)
const genForm = reactive({ title: '', taskId: null })
const genRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  taskId: [{ required: true, message: '请选择任务', trigger: 'change' }]
}

const detailVisible = ref(false)
const detailData = ref(null)

async function loadList() {
  loading.value = true
  try {
    const res = await getReportList({ page: page.value, pageSize: pageSize.value, taskId: filterTaskId.value })
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

async function loadTaskList() {
  try {
    const res = await getTaskList({ pageSize: 100 })
    taskList.value = res.data.list || res.data || []
  } catch {}
}

function openGenerateDialog() {
  Object.assign(genForm, { title: '', taskId: null })
  generateDialogVisible.value = true
  loadTaskList()
}

async function handleGenerate() {
  const valid = await genFormRef.value.validate().catch(() => false)
  if (!valid) return
  generating.value = true
  try {
    await generateReport({ ...genForm })
    ElMessage.success('报告生成成功')
    generateDialogVisible.value = false
    loadList()
  } finally {
    generating.value = false
  }
}

async function openDetail(row) {
  const res = await getReport(row.id)
  detailData.value = res.data
  detailVisible.value = true
}

async function handleReview(row) {
  await ElMessageBox.confirm('确定审核通过该报告？', '提示', { type: 'warning' })
  await updateReport(row.id, { status: 'reviewed' })
  ElMessage.success('审核通过')
  loadList()
}

async function handlePublish(row) {
  await ElMessageBox.confirm('确定发布该报告？', '提示', { type: 'warning' })
  await updateReport(row.id, { status: 'published' })
  ElMessage.success('发布成功')
  loadList()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除报告「${row.title}」？`, '提示', { type: 'warning' })
  await deleteReport(row.id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(() => {
  loadList()
  loadTaskList()
})
</script>

<style scoped>
.report-detail-title {
  text-align: center;
  margin-bottom: 16px;
}

.report-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.report-stats {
  margin-bottom: 20px;
}

.report-stats h4,
.report-section h4 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.severity-bar {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  height: 28px;
}

.severity-bar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.severity-bar-item:nth-child(1) { background: #67c23a; }
.severity-bar-item:nth-child(2) { background: #e6a23c; }
.severity-bar-item:nth-child(3) { background: #f56c6c; }
.severity-bar-item:nth-child(4) { background: #c45656; }

.bar-label {
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-name {
  width: 60px;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}

.category-item .el-progress {
  flex: 1;
}

.report-section {
  margin-bottom: 20px;
}

.report-content {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}
</style>
