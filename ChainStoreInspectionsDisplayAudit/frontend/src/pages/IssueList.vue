<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Filter,
  Plus,
  Clock,
  MapPin,
  AlertTriangle,
  Eye,
  Send,
  Wrench,
  CheckCircle2,
  Calendar,
  ChevronDown,
  AlertCircle,
  X
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getIssues, createIssue } from '@/api/issue'
import { getStores } from '@/api/store'
import type { Issue, Store, PaginationParams } from '@/types'
import StatusTag from '@/components/StatusTag.vue'

const router = useRouter()

const loading = ref(false)
const issues = ref<Issue[]>([])
const stores = ref<Store[]>([])
const total = ref(0)

const pagination = reactive<PaginationParams>({
  page: 1,
  pageSize: 10
})

const filters = reactive({
  status: '',
  level: '',
  type: '',
  startDate: '',
  endDate: '',
  keyword: ''
})

const createDialogVisible = ref(false)
const createForm = reactive({
  description: '',
  level: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  storeId: null as number | null,
  type: ''
})

const statusOptions = [
  { value: 'pending', label: '待整改' },
  { value: 'rectifying', label: '整改中' },
  { value: 'resolved', label: '已解决' },
  { value: 'verified', label: '已验证' }
]

const levelOptions = [
  { value: 'low', label: '轻微', color: '#3b82f6' },
  { value: 'medium', label: '一般', color: '#f59e0b' },
  { value: 'high', label: '严重', color: '#f97316' },
  { value: 'critical', label: '致命', color: '#ef4444' }
]

const typeOptions = [
  { value: '环境卫生', label: '环境卫生' },
  { value: '服务质量', label: '服务质量' },
  { value: '食品安全', label: '食品安全' },
  { value: '设施设备', label: '设施设备' },
  { value: '商品陈列', label: '商品陈列' },
  { value: '其他', label: '其他' }
]

const levelConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: '轻微', color: '#3b82f6', bgColor: '#dbeafe' },
  medium: { label: '一般', color: '#f59e0b', bgColor: '#fef3c7' },
  high: { label: '严重', color: '#f97316', bgColor: '#ffedd5' },
  critical: { label: '致命', color: '#ef4444', bgColor: '#fee2e2' }
}

const statusTimeline = [
  { status: 'pending', label: '待整改', icon: AlertCircle },
  { status: 'rectifying', label: '整改中', icon: Wrench },
  { status: 'resolved', label: '已解决', icon: CheckCircle2 },
  { status: 'verified', label: '已验证', icon: CheckCircle2 }
]

const fetchIssues = async () => {
  loading.value = true
  try {
    const params = {
      ...pagination,
      ...filters
    }
    const response = await getIssues(params)
    if (response.code === 0) {
      issues.value = response.data.list
      total.value = response.data.total
    }
  } catch (error) {
    console.error('获取问题列表失败:', error)
    ElMessage.error('获取问题列表失败')
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

const handleSearch = () => {
  pagination.page = 1
  fetchIssues()
}

const handleReset = () => {
  filters.status = ''
  filters.level = ''
  filters.type = ''
  filters.startDate = ''
  filters.endDate = ''
  filters.keyword = ''
  pagination.page = 1
  fetchIssues()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchIssues()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchIssues()
}

const getRemainingDays = (deadline?: string) => {
  if (!deadline) return null
  const today = dayjs()
  const dead = dayjs(deadline)
  const diff = dead.diff(today, 'day')
  return diff
}

const getRemainingDaysText = (deadline?: string) => {
  const days = getRemainingDays(deadline)
  if (days === null) return '-'
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`
  if (days === 0) return '今日截止'
  return `剩余 ${days} 天`
}

const getRemainingDaysClass = (deadline?: string) => {
  const days = getRemainingDays(deadline)
  if (days === null) return ''
  if (days < 0) return 'text-red-600'
  if (days <= 2) return 'text-orange-600'
  if (days <= 5) return 'text-yellow-600'
  return 'text-green-600'
}

const getStoreName = (issue: Issue) => {
  return issue.record?.store?.name || '未知门店'
}

const getIssueType = (issue: Issue) => {
  return issue.record?.items?.[0]?.itemTitle || '未分类'
}

const getTimelineStatus = (currentStatus: string) => {
  const currentIndex = statusTimeline.findIndex(t => t.status === currentStatus)
  return statusTimeline.map((item, index) => ({
    ...item,
    done: index < currentIndex,
    current: index === currentIndex
  }))
}

const handleViewDetail = (issue: Issue) => {
  router.push(`/issues/${issue.id}`)
}

const handleAssign = (issue: Issue) => {
  router.push(`/issues/${issue.id}?action=assign`)
}

const handleRectify = (issue: Issue) => {
  router.push(`/issues/${issue.id}?action=rectify`)
}

const handleRecheck = (issue: Issue) => {
  router.push(`/issues/${issue.id}?action=recheck`)
}

const openCreateDialog = () => {
  createForm.description = ''
  createForm.level = 'medium'
  createForm.storeId = null
  createForm.type = ''
  createDialogVisible.value = true
}

const handleCreateIssue = async () => {
  if (!createForm.description.trim()) {
    ElMessage.warning('请输入问题描述')
    return
  }
  if (!createForm.storeId) {
    ElMessage.warning('请选择门店')
    return
  }
  if (!createForm.type) {
    ElMessage.warning('请选择问题类型')
    return
  }

  try {
    const response = await createIssue({
      description: createForm.description,
      level: createForm.level,
      storeId: createForm.storeId,
      type: createForm.type
    })
    if (response.code === 0) {
      ElMessage.success('问题登记成功')
      createDialogVisible.value = false
      fetchIssues()
    }
  } catch (error) {
    console.error('登记问题失败:', error)
    ElMessage.error('登记问题失败')
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(() => {
  fetchIssues()
  fetchStores()
})
</script>

<template>
  <div class="issue-list-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">问题整改</h2>
        <p class="page-desc">管理和跟踪门店巡检发现的问题整改情况</p>
      </div>
      <el-button type="primary" :icon="Plus" class="create-btn" @click="openCreateDialog">
        登记问题
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="filter-header">
        <Filter class="filter-icon" />
        <span class="filter-title">筛选条件</span>
      </div>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable class="filter-select">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="filters.level" placeholder="全部等级" clearable class="filter-select">
            <el-option v-for="item in levelOptions" :key="item.value" :value="item.value">
              <span class="level-option">
                <span class="level-dot" :style="{ backgroundColor: item.color }"></span>
                {{ item.label }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.type" placeholder="全部类型" clearable class="filter-select">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.startDate"
            type="date"
            placeholder="开始日期"
            value-format="YYYY-MM-DD"
            class="filter-date"
          />
          <span class="date-separator">至</span>
          <el-date-picker
            v-model="filters.endDate"
            type="date"
            placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="filter-date"
          />
        </el-form-item>
        <el-form-item>
          <div class="search-wrapper">
            <Search class="search-icon" />
            <el-input
              v-model="filters.keyword"
              placeholder="搜索问题编号、标题、门店"
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

    <div class="issues-list" v-loading="loading" element-loading-text="加载中...">
      <div v-if="issues.length === 0 && !loading" class="empty-state">
        <AlertCircle class="empty-icon" />
        <p class="empty-text">暂无问题数据</p>
      </div>
      
      <div v-for="issue in issues" :key="issue.id" class="issue-card">
        <div class="card-header">
          <div class="issue-id">
            <span class="id-label">问题编号</span>
            <span class="id-value">#{{ issue.id }}</span>
          </div>
          <div class="card-actions">
            <el-button type="primary" link :icon="Eye" @click="handleViewDetail(issue)">查看详情</el-button>
            <el-button v-if="issue.status === 'pending'" type="warning" link :icon="Send" @click="handleAssign(issue)">派单</el-button>
            <el-button v-if="issue.status === 'rectifying'" type="success" link :icon="Wrench" @click="handleRectify(issue)">整改</el-button>
            <el-button v-if="issue.status === 'resolved'" type="primary" link :icon="CheckCircle2" @click="handleRecheck(issue)">复查</el-button>
          </div>
        </div>

        <div class="card-body">
          <h3 class="issue-title">{{ issue.description }}</h3>
          
          <div class="issue-tags">
            <el-tag 
              class="level-tag" 
              :style="{ 
                backgroundColor: levelConfig[issue.level]?.bgColor,
                color: levelConfig[issue.level]?.color,
                borderColor: levelConfig[issue.level]?.color + '40'
              }"
              effect="light"
              size="small"
            >
              {{ levelConfig[issue.level]?.label }}
            </el-tag>
            <StatusTag :status="issue.status" type="issue" />
            <el-tag type="info" effect="plain" size="small">{{ getIssueType(issue) }}</el-tag>
          </div>

          <div class="issue-meta">
            <div class="meta-item">
              <MapPin class="meta-icon" />
              <span>{{ getStoreName(issue) }}</span>
            </div>
            <div class="meta-item">
              <Calendar class="meta-icon" />
              <span>发现时间：{{ formatDate(issue.createdAt) }}</span>
            </div>
            <div class="meta-item" :class="getRemainingDaysClass(issue.deadline)">
              <Clock class="meta-icon" />
              <span>{{ getRemainingDaysText(issue.deadline) }}</span>
            </div>
          </div>

          <div class="timeline-wrapper">
            <div class="timeline">
              <div 
                v-for="(item, index) in getTimelineStatus(issue.status)" 
                :key="item.status"
                class="timeline-node"
                :class="{ done: item.done, current: item.current }"
              >
                <div class="node-circle">
                  <component :is="item.icon" class="node-icon" />
                </div>
                <span class="node-label">{{ item.label }}</span>
                <div v-if="index < getTimelineStatus(issue.status).length - 1" class="node-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog 
      v-model="createDialogVisible" 
      title="登记问题" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="createForm" label-width="80px" class="create-form">
        <el-form-item label="问题描述" required>
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请详细描述问题情况"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="问题等级" required>
          <el-radio-group v-model="createForm.level">
            <el-radio-button v-for="item in levelOptions" :key="item.value" :value="item.value">
              <span class="radio-label">
                <span class="level-dot" :style="{ backgroundColor: item.color }"></span>
                {{ item.label }}
              </span>
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属门店" required>
          <el-select v-model="createForm.storeId" placeholder="请选择门店" class="full-width">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题类型" required>
          <el-select v-model="createForm.type" placeholder="请选择问题类型" class="full-width">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateIssue">确认登记</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.issue-list-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f8fafc;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.create-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
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
}

.filter-select {
  width: 140px;
}

.filter-date {
  width: 130px;
}

.date-separator {
  margin: 0 8px;
  color: #94a3b8;
}

.search-wrapper {
  position: relative;
  width: 280px;
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

.level-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.full-width {
  width: 100%;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.empty-text {
  color: #94a3b8;
  margin: 0;
}

.issue-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.issue-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f8fafc;
  background: #fafbfc;
}

.issue-id {
  display: flex;
  align-items: center;
  gap: 8px;
}

.id-label {
  font-size: 12px;
  color: #94a3b8;
}

.id-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 20px;
}

.issue-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.issue-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.level-tag {
  font-weight: 500;
}

.issue-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.timeline-wrapper {
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}

.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.node-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  z-index: 1;
}

.node-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.node-label {
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.node-line {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.timeline-node.done .node-circle {
  background: #dcfce7;
  border-color: #22c55e;
}

.timeline-node.done .node-icon {
  color: #22c55e;
}

.timeline-node.done .node-label {
  color: #22c55e;
}

.timeline-node.done .node-line {
  background: #22c55e;
}

.timeline-node.current .node-circle {
  background: #dbeafe;
  border-color: #3b82f6;
  animation: pulse 2s infinite;
}

.timeline-node.current .node-icon {
  color: #3b82f6;
}

.timeline-node.current .node-label {
  color: #3b82f6;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.create-form {
  padding: 16px 0;
}

@media (max-width: 768px) {
  .issue-list-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .create-btn {
    width: 100%;
  }

  .filter-form {
    flex-direction: column;
  }

  .filter-select,
  .filter-date,
  .search-wrapper {
    width: 100%;
  }

  .issue-meta {
    flex-direction: column;
    gap: 8px;
  }

  .timeline {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .timeline-node {
    min-width: 80px;
  }
}
</style>
