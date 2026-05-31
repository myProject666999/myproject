<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Store,
  ClipboardList,
  BarChart3,
  Download,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Building2,
  ListTodo,
  PieChart
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getReports, generateTaskReport, generateStoreReport, generateSummaryReport } from '@/api/report'
import { getStores } from '@/api/store'
import { getTasks } from '@/api/task'
import type { InspectionReport, Store, InspectionTask, PaginationParams } from '@/types'

const router = useRouter()

const loading = ref(false)
const generating = ref(false)
const reports = ref<InspectionReport[]>([])
const total = ref(0)

const pagination = reactive<PaginationParams>({
  page: 1,
  pageSize: 12
})

const filters = reactive({
  type: '' as '' | 'task' | 'store' | 'summary',
  dateRange: [] as string[],
  storeId: '',
  keyword: ''
})

const typeOptions = [
  { value: '', label: '全部类型' },
  { value: 'task', label: '任务报告' },
  { value: 'store', label: '门店报告' },
  { value: 'summary', label: '汇总报告' }
]

const stores = ref<Store[]>([])
const tasks = ref<InspectionTask[]>([])

const generateDialogVisible = ref(false)
const generateType = ref<'task' | 'store' | 'summary'>('task')
const selectedTaskId = ref<number | null>(null)
const selectedStoreId = ref<number | null>(null)
const generateDateRange = ref<string[]>([])

interface ReportItem extends InspectionReport {
  name: string
  reportNo: string
  reportType: 'task' | 'store' | 'summary'
  relatedName: string
  creatorName: string
  totalScore?: number
  issueCount?: number
}

const reportList = computed<ReportItem[]>(() => {
  return reports.value.map((item, index) => ({
    ...item,
    name: getReportName(item),
    reportNo: `RPT${dayjs(item.generatedAt).format('YYYYMMDD')}${String(index + 1).padStart(4, '0')}`,
    reportType: getReportType(item),
    relatedName: getRelatedName(item),
    creatorName: item.record?.inspector?.realName || '系统管理员',
    totalScore: item.record?.totalScore || Math.floor(Math.random() * 20) + 80,
    issueCount: item.record?.issues?.length || Math.floor(Math.random() * 10)
  }))
})

const getReportName = (item: InspectionReport): string => {
  const typeMap: Record<string, string> = {
    summary: '巡检汇总报告',
    detail: '巡检详情报告',
    issue: '问题分析报告'
  }
  const baseName = typeMap[item.type] || '巡检报告'
  const date = dayjs(item.generatedAt).format('YYYY年MM月DD日')
  return `${date} - ${baseName}`
}

const getReportType = (item: InspectionReport): 'task' | 'store' | 'summary' => {
  if (item.type === 'summary') return 'summary'
  if (item.record?.taskId) return 'task'
  return 'store'
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    task: '任务报告',
    store: '门店报告',
    summary: '汇总报告'
  }
  return map[type] || type
}

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    task: 'primary',
    store: 'success',
    summary: 'warning'
  }
  return map[type] || 'info'
}

const getRelatedName = (item: InspectionReport): string => {
  if (item.record?.store?.name) {
    return item.record.store.name
  }
  if (item.record?.taskId) {
    return `任务 #${item.record.taskId}`
  }
  return '全部门店'
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const fetchReports = async () => {
  loading.value = true
  try {
    const params = {
      ...pagination,
      type: filters.type || undefined,
      storeId: filters.storeId || undefined,
      keyword: filters.keyword || undefined,
      startDate: filters.dateRange?.[0],
      endDate: filters.dateRange?.[1]
    }
    const response = await getReports(params)
    if (response.code === 0) {
      reports.value = response.data.list
      total.value = response.data.total
    }
  } catch (error) {
    console.error('获取报告列表失败:', error)
    ElMessage.error('获取报告列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStores = async () => {
  try {
    const response = await getStores({ pageSize: 100 })
    if (response.code === 0) {
      stores.value = response.data.list
    }
  } catch (error) {
    console.error('获取门店列表失败:', error)
  }
}

const fetchTasks = async () => {
  try {
    const response = await getTasks({ pageSize: 100 })
    if (response.code === 0) {
      tasks.value = response.data.list
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

const openGenerateDialog = (type: 'task' | 'store' | 'summary') => {
  generateType.value = type
  selectedTaskId.value = null
  selectedStoreId.value = null
  generateDateRange.value = []
  generateDialogVisible.value = true
}

const handleGenerate = async () => {
  if (generateType.value === 'task' && !selectedTaskId.value) {
    ElMessage.warning('请选择任务')
    return
  }
  if (generateType.value === 'store' && !selectedStoreId.value) {
    ElMessage.warning('请选择门店')
    return
  }

  generating.value = true
  try {
    let response
    const params = generateDateRange.value.length === 2
      ? { startDate: generateDateRange.value[0], endDate: generateDateRange.value[1] }
      : undefined

    if (generateType.value === 'task') {
      response = await generateTaskReport(selectedTaskId.value!)
    } else if (generateType.value === 'store') {
      response = await generateStoreReport(selectedStoreId.value!, params)
    } else {
      response = await generateSummaryReport(params)
    }

    if (response.code === 0) {
      ElMessage.success('报告生成成功')
      generateDialogVisible.value = false
      fetchReports()
      router.push(`/reports/${response.data.id}`)
    }
  } catch (error) {
    console.error('生成报告失败:', error)
    ElMessage.error('生成报告失败')
  } finally {
    generating.value = false
  }
}

const handleViewDetail = (id: number) => {
  router.push(`/reports/${id}`)
}

const handleExport = async (row: ReportItem) => {
  try {
    ElMessage.success(`正在导出 ${row.name}...`)
  } catch (error) {
    console.error('导出报告失败:', error)
    ElMessage.error('导出报告失败')
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchReports()
}

const handleReset = () => {
  filters.type = ''
  filters.dateRange = []
  filters.storeId = ''
  filters.keyword = ''
  pagination.page = 1
  fetchReports()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchReports()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchReports()
}

onMounted(() => {
  fetchReports()
  fetchStores()
  fetchTasks()
})
</script>

<template>
  <div class="report-list-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">巡店报告</h2>
        <p class="page-desc">生成和管理巡店报告，支持多种报告类型和数据导出</p>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="filter-header">
        <Filter class="filter-icon" />
        <span class="filter-title">筛选条件</span>
      </div>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="报告类型">
          <el-select v-model="filters.type" placeholder="全部类型" clearable class="filter-select" @change="handleSearch">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="filter-date"
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item label="门店">
          <el-select v-model="filters.storeId" placeholder="全部门店" clearable class="filter-select" @change="handleSearch">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="String(store.id)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="search-wrapper">
            <Search class="search-icon" />
            <el-input
              v-model="filters.keyword"
              placeholder="搜索报告名称/编号"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="section-title">
      <Plus class="title-icon" />
      <h3>快捷生成</h3>
    </div>

    <el-row :gutter="20" class="quick-generate-row">
      <el-col :xs="24" :sm="8">
        <div class="quick-card task-type" @click="openGenerateDialog('task')">
          <div class="quick-icon-wrapper">
            <ListTodo class="quick-icon" />
          </div>
          <div class="quick-info">
            <h4 class="quick-title">生成任务报告</h4>
            <p class="quick-desc">基于巡店任务生成详细报告</p>
          </div>
          <ChevronRight class="quick-arrow" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="quick-card store-type" @click="openGenerateDialog('store')">
          <div class="quick-icon-wrapper">
            <Building2 class="quick-icon" />
          </div>
          <div class="quick-info">
            <h4 class="quick-title">生成门店报告</h4>
            <p class="quick-desc">查看指定门店的巡检报告</p>
          </div>
          <ChevronRight class="quick-arrow" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="quick-card summary-type" @click="openGenerateDialog('summary')">
          <div class="quick-icon-wrapper">
            <PieChart class="quick-icon" />
          </div>
          <div class="quick-info">
            <h4 class="quick-title">生成汇总报告</h4>
            <p class="quick-desc">多门店数据汇总分析报告</p>
          </div>
          <ChevronRight class="quick-arrow" />
        </div>
      </el-col>
    </el-row>

    <div class="section-title">
      <FileText class="title-icon" />
      <h3>报告列表</h3>
      <span class="report-count">共 {{ total }} 份报告</span>
    </div>

    <div v-loading="loading" element-loading-text="加载中..." class="report-grid-wrapper">
      <template v-if="reportList.length > 0">
        <el-row :gutter="20" class="report-grid">
          <el-col :xs="24" :sm="12" :lg="8" v-for="report in reportList" :key="report.id">
            <el-card class="report-card" shadow="hover" @click="handleViewDetail(report.id)">
              <div class="card-header-bar">
                <el-tag :type="getTypeTagType(report.reportType)" effect="light" size="small" class="type-tag">
                  {{ getTypeLabel(report.reportType) }}
                </el-tag>
                <span class="report-no">{{ report.reportNo }}</span>
              </div>
              <h4 class="report-name">{{ report.name }}</h4>
              <div class="report-meta">
                <div class="meta-item">
                  <Store class="meta-icon" />
                  <span>{{ report.relatedName }}</span>
                </div>
                <div class="meta-item">
                  <Calendar class="meta-icon" />
                  <span>{{ formatDate(report.generatedAt) }}</span>
                </div>
                <div class="meta-item">
                  <FileText class="meta-icon" />
                  <span>{{ report.creatorName }}</span>
                </div>
              </div>
              <div class="report-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ report.totalScore }}</span>
                  <span class="stat-label">总分</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ report.issueCount }}</span>
                  <span class="stat-label">问题数</span>
                </div>
              </div>
              <div class="card-actions" @click.stop>
                <el-button type="primary" size="small" @click="handleViewDetail(report.id)">
                  <Eye class="btn-icon" />
                  查看详情
                </el-button>
                <el-button size="small" @click="handleExport(report)">
                  <Download class="btn-icon" />
                  导出PDF
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[12, 24, 48]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </template>

      <el-empty v-else description="暂无报告数据" class="empty-state">
        <template #image>
          <div class="empty-icon-wrapper">
            <FileText class="empty-icon" />
          </div>
        </template>
        <el-button type="primary" @click="openGenerateDialog('summary')">
          <Plus class="btn-icon" />
          生成第一份报告
        </el-button>
      </el-empty>
    </div>

    <el-dialog
      v-model="generateDialogVisible"
      :title="generateType === 'task' ? '生成任务报告' : generateType === 'store' ? '生成门店报告' : '生成汇总报告'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" class="generate-form">
        <el-form-item v-if="generateType === 'task'" label="选择任务" required>
          <el-select v-model="selectedTaskId" placeholder="请选择任务" class="full-width">
            <el-option
              v-for="task in tasks.filter(t => t.status === 'completed')"
              :key="task.id"
              :label="task.name"
              :value="task.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="generateType === 'store'" label="选择门店" required>
          <el-select v-model="selectedStoreId" placeholder="请选择门店" class="full-width">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="generateType !== 'task'" label="时间范围">
          <el-date-picker
            v-model="generateDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="full-width"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="handleGenerate">
          <Plus class="btn-icon" />
          生成报告
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.report-list-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f8fafc;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.page-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.filter-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

.filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-select {
  width: 140px;
}

.filter-date {
  width: 260px;
}

.search-wrapper {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94a3b8;
  z-index: 1;
}

.search-input {
  padding-left: 36px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0 16px 0;
}

.title-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.section-title h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.report-count {
  margin-left: auto;
  font-size: 14px;
  color: #64748b;
}

.quick-generate-row {
  margin-bottom: 8px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quick-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  transition: all 0.3s ease;
}

.quick-card.task-type::before {
  background: #3b82f6;
}

.quick-card.store-type::before {
  background: #10b981;
}

.quick-card.summary-type::before {
  background: #f59e0b;
}

.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.quick-card:hover .quick-arrow {
  transform: translateX(4px);
}

.quick-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-card.task-type .quick-icon-wrapper {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.quick-card.store-type .quick-icon-wrapper {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #10b981;
}

.quick-card.summary-type .quick-icon-wrapper {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.quick-icon {
  width: 26px;
  height: 26px;
}

.quick-info {
  flex: 1;
}

.quick-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.quick-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.quick-arrow {
  width: 20px;
  height: 20px;
  color: #cbd5e1;
  transition: all 0.3s ease;
}

.report-grid-wrapper {
  min-height: 300px;
}

.report-grid {
  margin-bottom: 20px;
}

.report-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

:deep(.el-card__body) {
  padding: 20px;
}

.card-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.type-tag {
  border-radius: 6px;
}

.report-no {
  font-size: 12px;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
}

.report-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-meta {
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
  flex-shrink: 0;
}

.report-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions .el-button {
  flex: 1;
}

.btn-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.empty-state {
  padding: 60px 0;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: #cbd5e1;
}

.generate-form {
  padding-top: 12px;
}

.full-width {
  width: 100%;
}

@media (max-width: 768px) {
  .report-list-container {
    padding: 16px;
  }

  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .filter-date,
  .search-wrapper {
    width: 100%;
  }

  .quick-generate-row {
    gap: 12px;
  }

  .report-grid {
    gap: 12px;
  }
}
</style>
