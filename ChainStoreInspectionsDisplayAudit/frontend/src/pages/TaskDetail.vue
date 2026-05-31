<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Home,
  ClipboardList,
  Calendar,
  MapPin,
  User,
  Tag,
  Flag,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronRight
} from 'lucide-vue-next'
import dayjs from 'dayjs'
import { getTask, startTask, completeTask } from '@/api/task'
import { getRecords } from '@/api/record'
import { getIssues } from '@/api/issue'
import { getTemplate, getTemplateItems } from '@/api/template'
import { generateTaskReport } from '@/api/report'
import StatusTag from '@/components/StatusTag.vue'
import type {
  InspectionTask,
  InspectionRecord,
  Issue,
  ChecklistTemplate,
  ChecklistItem,
  InspectionItemRecord
} from '@/types'

const route = useRoute()
const router = useRouter()

const taskId = Number(route.params.id)

const loading = ref(false)
const task = ref<InspectionTask | null>(null)
const records = ref<InspectionRecord[]>([])
const issues = ref<Issue[]>([])
const template = ref<ChecklistTemplate | null>(null)
const templateItems = ref<ChecklistItem[]>([])

const expandedCategories = ref<Record<string, boolean>>({})

const priorityConfig: Record<string, { label: string; type: string }> = {
  high: { label: '高优先级', type: 'danger' },
  medium: { label: '中优先级', type: 'warning' },
  low: { label: '低优先级', type: 'info' }
}

const issueLevelConfig: Record<string, { label: string; type: string; color: string }> = {
  low: { label: '低', type: 'info', color: '#165DFF' },
  medium: { label: '中', type: 'warning', color: '#F59E0B' },
  high: { label: '高', type: 'danger', color: '#EF4444' },
  critical: { label: '严重', type: 'danger', color: '#DC2626' }
}

const fetchTaskDetail = async () => {
  loading.value = true
  try {
    const [taskRes, recordsRes, issuesRes] = await Promise.all([
      getTask(taskId),
      getRecords({ taskId, pageSize: 100 }),
      getIssues({ taskId, pageSize: 100 })
    ])

    if (taskRes.code === 0) {
      task.value = {
        ...taskRes.data,
        priority: (taskRes.data as any).priority || 'medium'
      }

      if (task.value.templateId) {
        const [templateRes, itemsRes] = await Promise.all([
          getTemplate(task.value.templateId),
          getTemplateItems(task.value.templateId)
        ])
        if (templateRes.code === 0) template.value = templateRes.data
        if (itemsRes.code === 0) {
          templateItems.value = itemsRes.data
          const categories = [...new Set(itemsRes.data.map(item => (item as any).category || '其他'))]
          categories.forEach(cat => {
            expandedCategories.value[cat] = true
          })
        }
      }
    }

    if (recordsRes.code === 0) records.value = recordsRes.data.list
    if (issuesRes.code === 0) issues.value = issuesRes.data.list
  } catch (error) {
    ElMessage.error('获取任务详情失败')
  } finally {
    loading.value = false
  }
}

const handleStart = async () => {
  try {
    await ElMessageBox.confirm('确定要开始执行这个任务吗？', '开始确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const response = await startTask(taskId)
    if (response.code === 0) {
      ElMessage.success('任务已开始')
      router.push(`/inspection/${taskId}`)
    }
  } catch {
    // 用户取消
  }
}

const handleComplete = async () => {
  try {
    await ElMessageBox.confirm('确定要完成这个任务吗？完成后将无法修改。', '完成确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const response = await completeTask(taskId)
    if (response.code === 0) {
      ElMessage.success('任务已完成')
      fetchTaskDetail()
    }
  } catch {
    // 用户取消
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消这个任务吗？', '取消确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('任务已取消')
    fetchTaskDetail()
  } catch {
    // 用户取消
  }
}

const handleGenerateReport = async () => {
  try {
    const response = await generateTaskReport(taskId)
    if (response.code === 0) {
      ElMessage.success('报告生成成功')
      router.push(`/reports/${response.data.id}`)
    }
  } catch (error) {
    ElMessage.error('报告生成失败')
  }
}

const handleBack = () => {
  router.back()
}

const toggleCategory = (category: string) => {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getStoreName = () => {
  if (task.value?.stores && task.value.stores.length > 0) {
    return task.value.stores.map(s => s.name).join('、')
  }
  return '未分配'
}

const getStoreAddress = () => {
  if (task.value?.stores && task.value.stores.length > 0) {
    const store = task.value.stores[0]
    return `${store.city}${store.district}${store.address}`
  }
  return '-'
}

const getInspectorNames = () => {
  if (task.value?.inspectors && task.value.inspectors.length > 0) {
    return task.value.inspectors.map(i => i.realName).join('、')
  }
  return '未分配'
}

const getItemsByCategory = () => {
  const grouped: Record<string, ChecklistItem[]> = {}
  templateItems.value.forEach(item => {
    const category = (item as any).category || '其他'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(item)
  })
  return grouped
}

const getRecordItems = (record: InspectionRecord) => {
  return record.items || []
}

const getTaskCode = (id: number) => {
  return `IT${String(id).padStart(6, '0')}`
}

onMounted(() => {
  fetchTaskDetail()
})
</script>

<template>
  <div class="task-detail-container" v-loading="loading">
    <div class="breadcrumb-bar">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item @click="router.push('/')">
            <Home :size="14" class="breadcrumb-icon" />
            首页
          </el-breadcrumb-item>
          <el-breadcrumb-item @click="router.push('/tasks')">
            <ClipboardList :size="14" class="breadcrumb-icon" />
            巡店任务
          </el-breadcrumb-item>
          <el-breadcrumb-item>任务详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-button text @click="handleBack">
        <ArrowLeft :size="16" />
        返回列表
      </el-button>
    </div>

    <template v-if="task">
      <el-card class="info-card" shadow="never">
        <div class="card-header">
          <div class="header-left">
            <h2 class="task-title">{{ task.name }}</h2>
            <div class="task-meta">
              <span class="task-code">{{ getTaskCode(task.id) }}</span>
              <StatusTag :status="task.status" type="task" />
              <el-tag
                :type="priorityConfig[(task as any).priority]?.type as any"
                effect="light"
                round
                size="small"
              >
                <Flag :size="12" class="tag-icon" />
                {{ priorityConfig[(task as any).priority]?.label || '中优先级' }}
              </el-tag>
            </div>
          </div>
          <div class="header-actions">
            <el-button
              v-if="task.status === 'pending'"
              type="primary"
              size="large"
              @click="handleStart"
            >
              <Play :size="16" />
              开始任务
            </el-button>
            <el-button
              v-if="task.status === 'in_progress'"
              type="success"
              size="large"
              @click="handleComplete"
            >
              <CheckCircle :size="16" />
              完成任务
            </el-button>
            <el-button
              v-if="task.status === 'pending' || task.status === 'in_progress'"
              size="large"
              @click="handleCancel"
            >
              <XCircle :size="16" />
              取消任务
            </el-button>
            <el-button
              v-if="task.status === 'completed'"
              type="primary"
              size="large"
              @click="handleGenerateReport"
            >
              <FileText :size="16" />
              生成报告
            </el-button>
          </div>
        </div>

        <el-divider />

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">
              <Tag :size="14" class="label-icon" />
              任务类型
            </div>
            <div class="info-value">{{ task.templateName || '常规巡检' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <Calendar :size="14" class="label-icon" />
              计划日期
            </div>
            <div class="info-value">{{ formatDate(task.startDate) }} ~ {{ formatDate(task.endDate) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <MapPin :size="14" class="label-icon" />
              巡检门店
            </div>
            <div class="info-value">{{ getStoreName() }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <MapPin :size="14" class="label-icon" />
              门店地址
            </div>
            <div class="info-value">{{ getStoreAddress() }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <User :size="14" class="label-icon" />
              巡店员
            </div>
            <div class="info-value">{{ getInspectorNames() }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <ClipboardList :size="14" class="label-icon" />
              巡检进度
            </div>
            <div class="info-value progress-value">
              <el-progress
                :percentage="task.progress"
                :stroke-width="8"
                :color="task.progress === 100 ? '#10B981' : '#165DFF'"
                style="width: 200px"
              />
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="section-card" shadow="never" v-if="template">
        <template #header>
          <div class="section-header">
            <h3 class="section-title">
              <ClipboardList class="section-icon" />
              检查模板信息
            </h3>
            <div class="template-stats">
              <el-tag type="info" effect="plain">总分：100 分</el-tag>
              <el-tag type="success" effect="plain">及格分：60 分</el-tag>
              <el-tag type="warning" effect="plain">检查项：{{ templateItems.length }} 项</el-tag>
            </div>
          </div>
        </template>

        <div class="template-name">
          <span class="name-label">模板名称：</span>
          <span class="name-value">{{ template.name }}</span>
          <span class="version-badge">v{{ template.version }}</span>
        </div>

        <div class="category-list">
          <div
            v-for="(items, category) in getItemsByCategory()"
            :key="category"
            class="category-section"
          >
            <div class="category-header" @click="toggleCategory(category)">
              <div class="category-title">
                <component
                  :is="expandedCategories[category] ? ChevronDown : ChevronRight"
                  :size="18"
                  class="expand-icon"
                />
                <span>{{ category }}</span>
                <el-tag size="small" type="info" effect="plain">{{ items.length }} 项</el-tag>
              </div>
            </div>
            <div v-show="expandedCategories[category]" class="category-items">
              <div v-for="item in items" :key="item.id" class="check-item">
                <div class="item-info">
                  <span class="item-title">{{ item.title }}</span>
                  <div class="item-tags">
                    <el-tag v-if="item.required" size="small" type="danger" effect="plain">必查</el-tag>
                    <el-tag size="small" type="info" effect="plain">{{ item.scoreWeight }} 分</el-tag>
                    <el-tag size="small" type="warning" effect="plain">需拍照</el-tag>
                  </div>
                </div>
                <div class="item-desc" v-if="item.description">
                  {{ item.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <h3 class="section-title">
              <FileText class="section-icon" />
              巡检记录
            </h3>
            <el-tag type="info" effect="plain">共 {{ records.length }} 条记录</el-tag>
          </div>
        </template>

        <el-table :data="records" style="width: 100%" stripe v-if="records.length > 0">
          <el-table-column prop="id" label="记录编号" width="120">
            <template #default="{ row }">
              <span class="record-code">IR{{ String(row.id).padStart(6, '0') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="store.name" label="门店" min-width="150">
            <template #default="{ row }">
              {{ row.store?.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="inspector.realName" label="巡店员" width="120">
            <template #default="{ row }">
              {{ row.inspector?.realName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="检查时间" width="180">
            <template #default="{ row }">
              {{ row.startTime ? formatDateTime(row.startTime) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalScore" label="得分" width="100">
            <template #default="{ row }">
              <span :class="{ 'text-success': row.passed, 'text-danger': !row.passed }">
                {{ row.totalScore }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="passScore" label="及格分" width="100">
            <template #default="{ row }">
              {{ row.passScore }}
            </template>
          </el-table-column>
          <el-table-column prop="passed" label="结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.passed ? 'success' : 'danger'" effect="light" size="small">
                {{ row.passed ? '合格' : '不合格' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <StatusTag :status="row.status" type="record" />
            </template>
          </el-table-column>
          <el-table-column label="检查项详情" min-width="300">
            <template #default="{ row }">
              <div class="record-items">
                <div
                  v-for="item in getRecordItems(row).slice(0, 3)"
                  :key="item.id"
                  class="record-item-mini"
                >
                  <span class="item-name">{{ item.itemTitle }}</span>
                  <span class="item-score">{{ item.score }}/{{ item.fullScore }}</span>
                </div>
                <div v-if="getRecordItems(row).length > 3" class="more-items">
                  ...还有 {{ getRecordItems(row).length - 3 }} 项
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div v-else class="empty-records">
          <FileText :size="48" class="empty-icon" />
          <p>暂无巡检记录</p>
        </div>
      </el-card>

      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <h3 class="section-title">
              <AlertTriangle class="section-icon" />
              发现的问题
            </h3>
            <div class="issue-stats">
              <el-tag type="danger" effect="plain">严重：{{ issues.filter(i => i.level === 'critical').length }}</el-tag>
              <el-tag type="danger" effect="plain">高：{{ issues.filter(i => i.level === 'high').length }}</el-tag>
              <el-tag type="warning" effect="plain">中：{{ issues.filter(i => i.level === 'medium').length }}</el-tag>
              <el-tag type="info" effect="plain">低：{{ issues.filter(i => i.level === 'low').length }}</el-tag>
            </div>
          </div>
        </template>

        <div v-if="issues.length > 0" class="issue-grid">
          <div v-for="issue in issues" :key="issue.id" class="issue-card">
            <div class="issue-header">
              <div class="issue-title">
                <AlertTriangle
                  :size="16"
                  :style="{ color: issueLevelConfig[issue.level]?.color }"
                />
                <span>{{ issue.description }}</span>
              </div>
              <div class="issue-tags">
                <el-tag
                  :type="issueLevelConfig[issue.level]?.type as any"
                  effect="light"
                  size="small"
                >
                  {{ issueLevelConfig[issue.level]?.label }}
                </el-tag>
                <StatusTag :status="issue.status" type="issue" />
              </div>
            </div>
            <div class="issue-body">
              <div class="issue-info">
                <div class="info-item">
                  <span class="label">问题编号：</span>
                  <span class="value">ISSUE{{ String(issue.id).padStart(6, '0') }}</span>
                </div>
                <div class="info-item">
                  <span class="label">创建时间：</span>
                  <span class="value">{{ formatDateTime(issue.createdAt) }}</span>
                </div>
                <div class="info-item" v-if="issue.deadline">
                  <span class="label">整改期限：</span>
                  <span class="value">{{ formatDate(issue.deadline) }}</span>
                </div>
                <div class="info-item" v-if="issue.handler">
                  <span class="label">处理人：</span>
                  <span class="value">{{ issue.handler.realName }}</span>
                </div>
              </div>
              <div class="issue-photos" v-if="issue.photos && issue.photos.length > 0">
                <div class="photos-label">
                  <Camera :size="14" />
                  现场照片 ({{ issue.photos.length }})
                </div>
                <div class="photos-list">
                  <img
                    v-for="photo in issue.photos.slice(0, 4)"
                    :key="photo.id"
                    :src="photo.thumbnailUrl || photo.url"
                    class="issue-photo"
                  />
                  <div v-if="issue.photos.length > 4" class="more-photos">
                    +{{ issue.photos.length - 4 }}
                  </div>
                </div>
              </div>
            </div>
            <div class="issue-footer">
              <el-button type="primary" link size="small" @click="router.push(`/issues/${issue.id}`)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>

        <div v-else class="empty-records">
          <CheckCircle :size="48" class="empty-icon success" />
          <p>暂无发现问题</p>
        </div>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.task-detail-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #F8FAFC;
}

.breadcrumb-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.breadcrumb-icon {
  margin-right: 4px;
}

.info-card {
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-title {
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-code {
  font-size: 13px;
  color: #64748B;
  background: #F1F5F9;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'SF Mono', monospace;
}

.tag-icon {
  margin-right: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

.label-icon {
  color: #94A3B8;
}

.info-value {
  font-size: 15px;
  color: #1E293B;
  font-weight: 500;
}

.progress-value {
  display: flex;
  align-items: center;
}

.section-card {
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.section-icon {
  color: #165DFF;
  width: 20px;
  height: 20px;
}

.template-stats,
.issue-stats {
  display: flex;
  gap: 8px;
}

.template-name {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: #F5F8FF;
  border-radius: 12px;
  margin-bottom: 20px;
}

.name-label {
  font-size: 14px;
  color: #64748B;
}

.name-value {
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
}

.version-badge {
  background: #165DFF;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-section {
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.category-header {
  padding: 14px 20px;
  background: #F8FAFC;
  cursor: pointer;
  transition: background 0.2s;
}

.category-header:hover {
  background: #F1F5F9;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1E293B;
}

.expand-icon {
  color: #64748B;
  transition: transform 0.2s;
}

.category-items {
  padding: 0 20px 20px;
}

.check-item {
  padding: 12px 0;
  border-bottom: 1px solid #F1F5F9;
}

.check-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.item-title {
  font-size: 14px;
  color: #1E293B;
  font-weight: 500;
}

.item-tags {
  display: flex;
  gap: 6px;
}

.item-desc {
  font-size: 13px;
  color: #64748B;
  padding-left: 4px;
}

.record-code {
  font-size: 12px;
  color: #64748B;
  font-family: 'SF Mono', monospace;
}

.text-success {
  color: #10B981;
  font-weight: 600;
}

.text-danger {
  color: #EF4444;
  font-weight: 600;
}

.record-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-item-mini {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.item-name {
  color: #64748B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.item-score {
  color: #1E293B;
  font-weight: 500;
  flex-shrink: 0;
}

.more-items {
  font-size: 12px;
  color: #94A3B8;
  padding-top: 4px;
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #94A3B8;
}

.empty-icon {
  margin-bottom: 12px;
  color: #D0D5DD;
}

.empty-icon.success {
  color: #10B981;
}

.issue-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.issue-card {
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.issue-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.issue-header {
  padding: 16px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.issue-title {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #1E293B;
  font-weight: 500;
  line-height: 1.5;
  flex: 1;
}

.issue-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.issue-body {
  padding: 12px 16px;
}

.issue-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-bottom: 12px;
}

.issue-info .info-item {
  flex-direction: row;
  gap: 4px;
  font-size: 12px;
}

.issue-info .label {
  color: #94A3B8;
}

.issue-info .value {
  color: #64748B;
}

.issue-photos {
  margin-top: 12px;
}

.photos-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748B;
  margin-bottom: 8px;
}

.photos-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.issue-photo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.more-photos {
  width: 60px;
  height: 60px;
  background: #F1F5F9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748B;
  font-weight: 500;
}

.issue-footer {
  padding: 12px 16px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #F1F5F9;
}

:deep(.el-divider) {
  margin: 16px 0;
}

@media (max-width: 992px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .issue-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .task-detail-container {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-actions .el-button {
    flex: 1;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .template-stats,
  .issue-stats {
    flex-wrap: wrap;
  }
}
</style>
