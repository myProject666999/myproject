<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronRight,
  Home,
  MapPin,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Wrench,
  Send,
  CheckCircle2,
  XCircle,
  Camera,
  ZoomIn,
  X,
  ArrowLeft,
  FileText,
  Upload
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getIssue, assignIssue } from '@/api/issue'
import { 
  createRectification, 
  submitRectification, 
  recheckRectification 
} from '@/api/rectification'
import { getUsers } from '@/api/user'
import type { Issue, User, Photo, Rectification, RectificationStatusLog } from '@/types'
import StatusTag from '@/components/StatusTag.vue'
import PhotoUpload from '@/components/PhotoUpload.vue'

const route = useRoute()
const router = useRouter()

const issueId = computed(() => Number(route.params.id))
const actionParam = computed(() => route.query.action as string)

const loading = ref(false)
const issue = ref<Issue | null>(null)
const users = ref<User[]>([])
const statusLogs = ref<RectificationStatusLog[]>([])

const assignDialogVisible = ref(false)
const rectifyDialogVisible = ref(false)
const recheckDialogVisible = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')

const assignForm = reactive({
  handlerId: null as number | null,
  deadline: ''
})

const rectifyForm = reactive({
  description: '',
  photos: [] as Photo[]
})

const recheckForm = reactive({
  result: 'approved' as 'approved' | 'rejected',
  remark: ''
})

const currentPhotoIndex = ref(0)

const levelConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: '轻微', color: '#3b82f6', bgColor: '#dbeafe' },
  medium: { label: '一般', color: '#f59e0b', bgColor: '#fef3c7' },
  high: { label: '严重', color: '#f97316', bgColor: '#ffedd5' },
  critical: { label: '致命', color: '#ef4444', bgColor: '#fee2e2' }
}

const fetchIssue = async () => {
  loading.value = true
  try {
    const response = await getIssue(issueId.value)
    if (response.code === 0) {
      issue.value = response.data
      initMockStatusLogs()
    }
  } catch (error) {
    console.error('获取问题详情失败:', error)
    ElMessage.error('获取问题详情失败')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const response = await getUsers({ pageSize: 100 })
    if (response.code === 0) {
      users.value = response.data.list
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

const initMockStatusLogs = () => {
  if (!issue.value) return
  
  statusLogs.value = [
    {
      id: 1,
      issueId: issue.value.id,
      oldStatus: '',
      newStatus: 'pending',
      operatorId: 1,
      operator: { id: 1, username: 'admin', realName: '张巡检员', email: '', phone: '', role: 'inspector', status: 1, createdAt: '', updatedAt: '' },
      remark: '发现问题，待整改',
      createdAt: issue.value.createdAt
    }
  ]

  if (issue.value.status !== 'pending') {
    statusLogs.value.push({
      id: 2,
      issueId: issue.value.id,
      oldStatus: 'pending',
      newStatus: 'rectifying',
      operatorId: 2,
      operator: { id: 2, username: 'manager', realName: '李经理', email: '', phone: '', role: 'manager', status: 1, createdAt: '', updatedAt: '' },
      remark: '已派单给王整改员，要求3天内完成',
      createdAt: dayjs(issue.value.createdAt).add(1, 'hour').format()
    })
  }

  if (issue.value.status === 'resolved' || issue.value.status === 'verified') {
    statusLogs.value.push({
      id: 3,
      issueId: issue.value.id,
      oldStatus: 'rectifying',
      newStatus: 'resolved',
      operatorId: 3,
      operator: { id: 3, username: 'rectifier', realName: '王整改员', email: '', phone: '', role: 'inspector', status: 1, createdAt: '', updatedAt: '' },
      remark: '已完成整改，请复查',
      createdAt: dayjs(issue.value.createdAt).add(2, 'day').format()
    })
  }

  if (issue.value.status === 'verified') {
    statusLogs.value.push({
      id: 4,
      issueId: issue.value.id,
      oldStatus: 'resolved',
      newStatus: 'verified',
      operatorId: 2,
      operator: { id: 2, username: 'manager', realName: '李经理', email: '', phone: '', role: 'manager', status: 1, createdAt: '', updatedAt: '' },
      remark: '复查通过，问题已解决',
      createdAt: dayjs(issue.value.createdAt).add(3, 'day').format()
    })
  }
}

const handleBack = () => {
  router.back()
}

const openAssignDialog = () => {
  assignForm.handlerId = null
  assignForm.deadline = ''
  assignDialogVisible.value = true
}

const handleAssign = async () => {
  if (!assignForm.handlerId) {
    ElMessage.warning('请选择整改人')
    return
  }
  if (!assignForm.deadline) {
    ElMessage.warning('请选择截止日期')
    return
  }

  try {
    const response = await assignIssue(issueId.value, {
      handlerId: assignForm.handlerId,
      deadline: assignForm.deadline
    })
    if (response.code === 0) {
      ElMessage.success('派单成功')
      assignDialogVisible.value = false
      fetchIssue()
    }
  } catch (error) {
    console.error('派单失败:', error)
    ElMessage.error('派单失败')
  }
}

const openRectifyDialog = () => {
  rectifyForm.description = ''
  rectifyForm.photos = []
  rectifyDialogVisible.value = true
}

const handleRectify = async () => {
  if (!rectifyForm.description.trim()) {
    ElMessage.warning('请填写整改说明')
    return
  }

  try {
    const response = await createRectification({
      issueId: issueId.value,
      description: rectifyForm.description,
      photos: rectifyForm.photos.map(p => p.id)
    })
    if (response.code === 0) {
      await submitRectification(response.data.id, {})
      ElMessage.success('整改提交成功')
      rectifyDialogVisible.value = false
      fetchIssue()
    }
  } catch (error) {
    console.error('提交整改失败:', error)
    ElMessage.error('提交整改失败')
  }
}

const openRecheckDialog = () => {
  recheckForm.result = 'approved'
  recheckForm.remark = ''
  recheckDialogVisible.value = true
}

const handleRecheck = async () => {
  if (!recheckForm.remark.trim()) {
    ElMessage.warning('请填写复查结果说明')
    return
  }

  const lastRectification = issue.value?.rectifications?.[issue.value.rectifications.length - 1]
  if (!lastRectification) {
    ElMessage.error('未找到整改单')
    return
  }

  try {
    const response = await recheckRectification(lastRectification.id, {
      result: recheckForm.result,
      remark: recheckForm.remark
    })
    if (response.code === 0) {
      ElMessage.success(recheckForm.result === 'approved' ? '复查通过' : '已驳回')
      recheckDialogVisible.value = false
      fetchIssue()
    }
  } catch (error) {
    console.error('复查失败:', error)
    ElMessage.error('复查失败')
  }
}

const handlePreview = (photo: Photo, index: number) => {
  currentPhotoIndex.value = index
  previewImage.value = photo.url
  previewVisible.value = true
}

const handlePrevPhoto = () => {
  if (!issue.value?.photos) return
  const photos = issue.value.photos
  currentPhotoIndex.value = (currentPhotoIndex.value - 1 + photos.length) % photos.length
  previewImage.value = photos[currentPhotoIndex.value].url
}

const handleNextPhoto = () => {
  if (!issue.value?.photos) return
  const photos = issue.value.photos
  currentPhotoIndex.value = (currentPhotoIndex.value + 1) % photos.length
  previewImage.value = photos[currentPhotoIndex.value].url
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const getStoreName = () => {
  return issue.value?.record?.store?.name || '未知门店'
}

const getInspectorName = () => {
  return issue.value?.record?.inspector?.realName || '未知'
}

const getIssueType = () => {
  return issue.value?.record?.items?.[0]?.itemTitle || '未分类'
}

const getCurrentRectification = (): Rectification | null => {
  if (!issue.value?.rectifications || issue.value.rectifications.length === 0) return null
  return issue.value.rectifications[issue.value.rectifications.length - 1]
}

const getHandlerName = () => {
  return issue.value?.handler?.realName || '未指派'
}

const getRemainingDays = () => {
  if (!issue.value?.deadline) return null
  const today = dayjs()
  const dead = dayjs(issue.value.deadline)
  const diff = dead.diff(today, 'day')
  return diff
}

const getRemainingDaysText = () => {
  const days = getRemainingDays()
  if (days === null) return '-'
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`
  if (days === 0) return '今日截止'
  return `剩余 ${days} 天`
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, any> = {
    pending: AlertCircle,
    rectifying: Wrench,
    resolved: CheckCircle2,
    verified: CheckCircle2
  }
  return icons[status] || AlertCircle
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    rectifying: '#3b82f6',
    resolved: '#22c55e',
    verified: '#10b981'
  }
  return colors[status] || '#6b7280'
}

onMounted(() => {
  fetchIssue()
  fetchUsers()
  
  if (actionParam.value === 'assign') {
    setTimeout(() => openAssignDialog(), 500)
  } else if (actionParam.value === 'rectify') {
    setTimeout(() => openRectifyDialog(), 500)
  } else if (actionParam.value === 'recheck') {
    setTimeout(() => openRecheckDialog(), 500)
  }
})
</script>

<template>
  <div class="issue-detail-container">
    <div class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <span class="breadcrumb-item" @click="router.push('/')">
          <Home class="breadcrumb-icon" />
          <span>首页</span>
        </span>
        <ChevronRight class="breadcrumb-separator" />
        <span class="breadcrumb-item" @click="router.push('/issues')">问题整改</span>
        <ChevronRight class="breadcrumb-separator" />
        <span class="breadcrumb-item active">问题详情</span>
      </div>
      <el-button :icon="ArrowLeft" text @click="handleBack">
        返回列表
      </el-button>
    </div>

    <div v-loading="loading" element-loading-text="加载中...">
      <template v-if="issue">
        <el-card class="info-card" shadow="never">
          <div class="card-header">
            <div class="header-left">
              <h2 class="issue-title">
                <span class="issue-id">#{{ issue.id }}</span>
                {{ issue.description }}
              </h2>
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
                <el-tag type="info" effect="plain" size="small">{{ getIssueType() }}</el-tag>
              </div>
            </div>
            <div class="header-actions">
              <el-button 
                v-if="issue.status === 'pending'" 
                type="warning" 
                :icon="Send"
                @click="openAssignDialog"
              >
                派单
              </el-button>
              <el-button 
                v-if="issue.status === 'rectifying'" 
                type="success" 
                :icon="Wrench"
                @click="openRectifyDialog"
              >
                提交整改
              </el-button>
              <el-button 
                v-if="issue.status === 'resolved'" 
                type="primary" 
                :icon="CheckCircle2"
                @click="openRecheckDialog"
              >
                复查
              </el-button>
            </div>
          </div>

          <el-descriptions :column="3" border class="info-descriptions">
            <el-descriptions-item label="门店名称">
              <div class="desc-item">
                <MapPin class="desc-icon" />
                <span>{{ getStoreName() }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="发现人">
              <div class="desc-item">
                <User class="desc-icon" />
                <span>{{ getInspectorName() }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="发现时间">
              <div class="desc-item">
                <Calendar class="desc-icon" />
                <span>{{ formatDateTime(issue.createdAt) }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="整改人">
              <div class="desc-item">
                <User class="desc-icon" />
                <span>{{ getHandlerName() }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="截止日期">
              <div class="desc-item">
                <Clock class="desc-icon" />
                <span>{{ issue.deadline ? formatDate(issue.deadline) : '-' }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="剩余时间">
              <div class="desc-item" :class="{
                'text-red-600': getRemainingDays() !== null && getRemainingDays()! < 0,
                'text-orange-600': getRemainingDays() !== null && getRemainingDays()! >= 0 && getRemainingDays()! <= 2,
                'text-yellow-600': getRemainingDays() !== null && getRemainingDays()! > 2 && getRemainingDays()! <= 5,
                'text-green-600': getRemainingDays() !== null && getRemainingDays()! > 5
              }">
                <Clock class="desc-icon" />
                <span>{{ getRemainingDaysText() }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-row :gutter="20" class="content-row">
          <el-col :xs="24" :lg="14">
            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header-title">
                  <Camera class="header-icon" />
                  <span>问题照片</span>
                  <span class="photo-count">({{ issue.photos?.length || 0 }}张)</span>
                </div>
              </template>
              
              <div v-if="issue.photos && issue.photos.length > 0" class="photo-carousel">
                <div class="carousel-main">
                  <img 
                    :src="issue.photos[currentPhotoIndex].url" 
                    class="main-photo" 
                    alt="问题照片"
                    @click="handlePreview(issue.photos[currentPhotoIndex], currentPhotoIndex)"
                  />
                  <div class="carousel-nav prev" @click="handlePrevPhoto">
                    <ChevronRight class="nav-icon" :style="{ transform: 'rotate(180deg)' }" />
                  </div>
                  <div class="carousel-nav next" @click="handleNextPhoto">
                    <ChevronRight class="nav-icon" />
                  </div>
                  <div class="carousel-counter">
                    {{ currentPhotoIndex + 1 }} / {{ issue.photos.length }}
                  </div>
                </div>
                <div class="carousel-thumbs">
                  <div 
                    v-for="(photo, index) in issue.photos" 
                    :key="photo.id"
                    class="thumb-item"
                    :class="{ active: index === currentPhotoIndex }"
                    @click="currentPhotoIndex = index"
                  >
                    <img :src="photo.thumbnailUrl || photo.url" alt="" />
                    <div class="thumb-overlay">
                      <ZoomIn class="thumb-icon" />
                    </div>
                  </div>
                </div>
                <div class="photo-meta">
                  <div class="meta-item">
                    <Calendar class="meta-icon" />
                    <span>拍摄时间：{{ formatDateTime(issue.photos[currentPhotoIndex].uploadedAt) }}</span>
                  </div>
                  <div class="meta-item">
                    <MapPin class="meta-icon" />
                    <span>拍摄位置：{{ issue.record?.store?.address || '未知' }}</span>
                  </div>
                </div>
              </div>
              
              <div v-else class="empty-photos">
                <Camera class="empty-icon" />
                <p>暂无照片</p>
              </div>
            </el-card>

            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header-title">
                  <FileText class="header-icon" />
                  <span>整改历史</span>
                </div>
              </template>
              
              <div class="timeline-container">
                <el-timeline>
                  <el-timeline-item
                    v-for="(log, index) in statusLogs"
                    :key="log.id"
                    :timestamp="formatDateTime(log.createdAt)"
                    :color="getStatusColor(log.newStatus)"
                  >
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <span class="timeline-operator">{{ log.operator?.realName }}</span>
                        <el-tag 
                          size="small"
                          :style="{ 
                            backgroundColor: getStatusColor(log.newStatus) + '15',
                            color: getStatusColor(log.newStatus),
                            borderColor: getStatusColor(log.newStatus) + '40'
                          }"
                        >
                          <component :is="getStatusIcon(log.newStatus)" class="tag-icon" />
                          {{ log.remark }}
                        </el-tag>
                      </div>
                      <p v-if="log.remark" class="timeline-remark">{{ log.remark }}</p>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :lg="10">
            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header-title">
                  <Wrench class="header-icon" />
                  <span>当前整改单</span>
                </div>
              </template>
              
              <div v-if="getCurrentRectification()" class="rectification-info">
                <div class="info-section">
                  <h4 class="section-label">整改说明</h4>
                  <p class="section-content">{{ getCurrentRectification()?.description }}</p>
                </div>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="item-label">整改人</span>
                    <span class="item-value">{{ getCurrentRectification()?.submitter?.realName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="item-label">提交时间</span>
                    <span class="item-value">{{ formatDateTime(getCurrentRectification()!.submittedAt) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="item-label">状态</span>
                    <StatusTag :status="getCurrentRectification()!.status" type="rectification" />
                  </div>
                </div>
                
                <div v-if="getCurrentRectification()?.photos && getCurrentRectification()!.photos!.length > 0" class="info-section">
                  <h4 class="section-label">整改照片</h4>
                  <div class="rectification-photos">
                    <div 
                      v-for="photo in getCurrentRectification()!.photos" 
                      :key="photo.id" 
                      class="rect-photo-item"
                      @click="handlePreview(photo, 0)"
                    >
                      <img :src="photo.thumbnailUrl || photo.url" alt="" />
                      <div class="rect-photo-overlay">
                        <ZoomIn class="overlay-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="empty-rectification">
                <Wrench class="empty-icon" />
                <p>暂无整改单</p>
                <p class="empty-desc">请先派单给相关人员进行整改</p>
              </div>
            </el-card>

            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header-title">
                  <CheckCircle2 class="header-icon" />
                  <span>操作按钮</span>
                </div>
              </template>
              
              <div class="action-buttons">
                <template v-if="issue.status === 'pending'">
                  <el-button 
                    type="warning" 
                    size="large" 
                    :icon="Send"
                    class="action-btn"
                    @click="openAssignDialog"
                  >
                    立即派单
                  </el-button>
                  <p class="action-desc">选择整改人员并设置整改期限</p>
                </template>
                
                <template v-else-if="issue.status === 'rectifying'">
                  <el-button 
                    type="success" 
                    size="large" 
                    :icon="Wrench"
                    class="action-btn"
                    @click="openRectifyDialog"
                  >
                    提交整改
                  </el-button>
                  <p class="action-desc">填写整改说明并上传整改照片</p>
                </template>
                
                <template v-else-if="issue.status === 'resolved'">
                  <div class="recheck-buttons">
                    <el-button 
                      type="success" 
                      size="large" 
                      :icon="CheckCircle2"
                      class="action-btn approve-btn"
                      @click="recheckForm.result = 'approved'; openRecheckDialog()"
                    >
                      通过
                    </el-button>
                    <el-button 
                      type="danger" 
                      size="large" 
                      :icon="XCircle"
                      class="action-btn reject-btn"
                      @click="recheckForm.result = 'rejected'; openRecheckDialog()"
                    >
                      驳回
                    </el-button>
                  </div>
                  <p class="action-desc">对整改结果进行复查</p>
                </template>
                
                <template v-else-if="issue.status === 'verified'">
                  <div class="completed-state">
                    <CheckCircle2 class="completed-icon" />
                    <p class="completed-text">问题已完成整改并通过复查</p>
                  </div>
                </template>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </div>

    <el-dialog 
      v-model="assignDialogVisible" 
      title="问题派单" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="assignForm" label-width="80px" class="dialog-form">
        <el-form-item label="整改人" required>
          <el-select v-model="assignForm.handlerId" placeholder="请选择整改人" class="full-width">
            <el-option 
              v-for="user in users" 
              :key="user.id" 
              :label="user.realName" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" required>
          <el-date-picker
            v-model="assignForm.deadline"
            type="date"
            placeholder="请选择截止日期"
            value-format="YYYY-MM-DD"
            class="full-width"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确认派单</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="rectifyDialogVisible" 
      title="提交整改" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="rectifyForm" label-width="80px" class="dialog-form">
        <el-form-item label="整改说明" required>
          <el-input
            v-model="rectifyForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述整改措施和结果"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="整改照片">
          <PhotoUpload 
            v-model="rectifyForm.photos" 
            type="rectification"
            :max-count="9"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rectifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRectify">提交整改</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="recheckDialogVisible" 
      title="问题复查" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="recheckForm" label-width="80px" class="dialog-form">
        <el-form-item label="复查结果">
          <el-radio-group v-model="recheckForm.result">
            <el-radio-button value="approved" class="radio-approve">
              <CheckCircle2 class="radio-icon" />
              通过
            </el-radio-button>
            <el-radio-button value="rejected" class="radio-reject">
              <XCircle class="radio-icon" />
              驳回
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="复查说明" required>
          <el-input
            v-model="recheckForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请填写复查结果说明"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recheckDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRecheck">确认提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" :show-close="false" width="auto" class="preview-dialog">
      <div class="preview-container">
        <img :src="previewImage" class="preview-img" />
        <div class="preview-close" @click="previewVisible = false">
          <X :size="24" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.issue-detail-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f8fafc;
}

.breadcrumb-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #3b82f6;
}

.breadcrumb-item.active {
  color: #1e293b;
  font-weight: 500;
  cursor: default;
}

.breadcrumb-icon {
  width: 16px;
  height: 16px;
}

.breadcrumb-separator {
  width: 16px;
  height: 16px;
  color: #cbd5e1;
}

.info-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left {
  flex: 1;
}

.issue-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.issue-id {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 600;
  background: #dbeafe;
  padding: 4px 12px;
  border-radius: 20px;
}

.issue-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.level-tag {
  font-weight: 500;
}

.info-descriptions {
  background: #fafbfc;
  border-radius: 12px;
}

.desc-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.desc-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.content-row {
  margin-bottom: 20px;
}

.section-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.card-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.header-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

.photo-count {
  font-size: 13px;
  color: #94a3b8;
  font-weight: normal;
}

.photo-carousel {
  padding: 16px;
}

.carousel-main {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #f1f5f9;
}

.main-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
}

.carousel-nav:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-nav.prev {
  left: 16px;
}

.carousel-nav.next {
  right: 16px;
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.carousel-counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  z-index: 2;
}

.carousel-thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.thumb-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.thumb-item.active {
  border-color: #3b82f6;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.thumb-item:hover .thumb-overlay {
  opacity: 1;
}

.thumb-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.photo-meta {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
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

.empty-photos,
.empty-rectification {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.empty-photos p,
.empty-rectification p {
  color: #94a3b8;
  margin: 0 0 4px 0;
}

.empty-desc {
  font-size: 12px;
  color: #cbd5e1;
}

.timeline-container {
  padding: 16px 0;
}

.timeline-content {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.timeline-operator {
  font-weight: 600;
  color: #1e293b;
}

.tag-icon {
  width: 12px;
  height: 12px;
  margin-right: 4px;
}

.timeline-remark {
  color: #64748b;
  margin: 0;
  font-size: 13px;
}

.rectification-info {
  padding: 16px 0;
}

.info-section {
  margin-bottom: 20px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 8px 0;
}

.section-content {
  color: #1e293b;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-label {
  font-size: 12px;
  color: #94a3b8;
}

.item-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.rectification-photos {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rect-photo-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.rect-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rect-photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.rect-photo-item:hover .rect-photo-overlay {
  opacity: 1;
}

.overlay-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.action-buttons {
  padding: 16px 0;
  text-align: center;
}

.action-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.recheck-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.approve-btn,
.reject-btn {
  flex: 1;
}

.action-desc {
  color: #94a3b8;
  font-size: 12px;
  margin: 0;
}

.completed-state {
  padding: 20px;
}

.completed-icon {
  width: 48px;
  height: 48px;
  color: #22c55e;
  margin-bottom: 12px;
}

.completed-text {
  color: #22c55e;
  font-weight: 600;
  margin: 0;
}

.dialog-form {
  padding: 16px 0;
}

.full-width {
  width: 100%;
}

.radio-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  vertical-align: middle;
}

.radio-approve :deep(.el-radio-button__inner) {
  color: #22c55e;
}

.radio-approve :deep(.is-active .el-radio-button__inner) {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.radio-reject :deep(.el-radio-button__inner) {
  color: #ef4444;
}

.radio-reject :deep(.is-active .el-radio-button__inner) {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
}

.preview-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.preview-close:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

@media (max-width: 768px) {
  .issue-detail-container {
    padding: 16px;
  }

  .breadcrumb-wrapper {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .photo-meta {
    flex-direction: column;
    gap: 8px;
  }

  .recheck-buttons {
    flex-direction: column;
  }
}
</style>
