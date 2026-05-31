<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Camera,
  Save,
  Send,
  Flag,
  WifiOff,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock
} from 'lucide-vue-next'
import dayjs from 'dayjs'
import { getTask, completeTask } from '@/api/task'
import { getTemplate, getTemplateItems } from '@/api/template'
import { createRecord, updateRecord } from '@/api/record'
import { createIssue } from '@/api/issue'
import ScoreSlider from '@/components/ScoreSlider.vue'
import PhotoUpload from '@/components/PhotoUpload.vue'
import type {
  InspectionTask,
  ChecklistTemplate,
  ChecklistItem,
  Photo,
  InspectionRecord
} from '@/types'

const route = useRoute()
const router = useRouter()

const taskId = Number(route.params.taskId)

const loading = ref(false)
const task = ref<InspectionTask | null>(null)
const template = ref<ChecklistTemplate | null>(null)
const templateItems = ref<ChecklistItem[]>([])
const currentRecord = ref<InspectionRecord | null>(null)

const isOffline = ref(false)
const locationVerified = ref(false)
const currentLocation = reactive({
  latitude: 39.9042,
  longitude: 116.4074,
  address: '北京市朝阳区建国路88号SOHO现代城',
  distance: 50
})

const expandedCategories = ref<Record<string, boolean>>({})
const expandedItems = ref<Record<number, boolean>>({})

interface ItemAnswer {
  itemId: number
  score: number
  fullScore: number
  passed: boolean
  remark: string
  photos: Photo[]
  completed: boolean
}

const answers = ref<Record<number, ItemAnswer>>({})

const issueDialogVisible = ref(false)
const currentIssueItem = ref<ChecklistItem | null>(null)
const issueForm = reactive({
  description: '',
  level: 'medium' as 'low' | 'medium' | 'high' | 'critical'
})

const passScore = 60
const totalScore = 100

const progress = computed(() => {
  const total = templateItems.value.length
  const completed = Object.values(answers.value).filter(a => a.completed).length
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  }
})

const currentScore = computed(() => {
  const completedAnswers = Object.values(answers.value).filter(a => a.completed)
  if (completedAnswers.length === 0) return 0
  const total = completedAnswers.reduce((sum, a) => sum + a.fullScore, 0)
  const score = completedAnswers.reduce((sum, a) => sum + a.score, 0)
  return total > 0 ? Math.round((score / total) * 100) : 0
})

const fetchData = async () => {
  loading.value = true
  try {
    const taskRes = await getTask(taskId)
    if (taskRes.code === 0) {
      task.value = taskRes.data
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
          itemsRes.data.forEach(item => {
            answers.value[item.id] = {
              itemId: item.id,
              score: item.scoreWeight,
              fullScore: item.scoreWeight,
              passed: true,
              remark: '',
              photos: [],
              completed: false
            }
          })
        }
      }
    }
    initMockLocation()
  } catch (error) {
    ElMessage.error('获取检查数据失败')
  } finally {
    loading.value = false
  }
}

const initMockLocation = () => {
  const mockLocations = [
    { lat: 39.9042, lng: 116.4074, address: '北京市朝阳区建国路88号SOHO现代城', distance: 45 },
    { lat: 31.2304, lng: 121.4737, address: '上海市浦东新区陆家嘴环路1000号', distance: 30 },
    { lat: 23.1291, lng: 113.2644, address: '广州市天河区天河路385号', distance: 80 }
  ]
  const loc = mockLocations[Math.floor(Math.random() * mockLocations.length)]
  currentLocation.latitude = loc.lat
  currentLocation.longitude = loc.lng
  currentLocation.address = loc.address
  currentLocation.distance = loc.distance
  locationVerified.value = loc.distance < 100
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

const toggleCategory = (category: string) => {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

const toggleItem = (itemId: number) => {
  expandedItems.value[itemId] = !expandedItems.value[itemId]
}

const handleScoreChange = (itemId: number, score: number) => {
  if (answers.value[itemId]) {
    answers.value[itemId].score = score
    answers.value[itemId].passed = score >= answers.value[itemId].fullScore * 0.6
  }
}

const handlePassedChange = (itemId: number, value: boolean) => {
  if (answers.value[itemId]) {
    answers.value[itemId].passed = value
  }
}

const handleRemarkChange = (itemId: number, value: string) => {
  if (answers.value[itemId]) {
    answers.value[itemId].remark = value
  }
}

const handlePhotosChange = (itemId: number, photos: Photo[]) => {
  if (answers.value[itemId]) {
    answers.value[itemId].photos = photos
  }
}

const markItemComplete = (itemId: number) => {
  if (answers.value[itemId]) {
    answers.value[itemId].completed = true
    expandedItems.value[itemId] = false
    ElMessage.success('检查项已保存')
  }
}

const openIssueDialog = (item: ChecklistItem) => {
  currentIssueItem.value = item
  issueForm.description = item.title + ' - 发现问题'
  issueForm.level = 'medium'
  issueDialogVisible.value = true
}

const handleCreateIssue = async () => {
  if (!currentIssueItem.value) return
  try {
    const response = await createIssue({
      ...issueForm,
      recordId: currentRecord.value?.id,
      itemId: currentIssueItem.value.id
    })
    if (response.code === 0) {
      ElMessage.success('问题登记成功')
      issueDialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('问题登记失败')
  }
}

const handleSaveDraft = async () => {
  try {
    const recordData = {
      taskId,
      storeId: task.value?.storeIds?.[0],
      templateId: task.value?.templateId,
      items: Object.values(answers.value).filter(a => a.completed).map(a => ({
        itemId: a.itemId,
        score: a.score,
        fullScore: a.fullScore,
        value: a.passed ? 'pass' : 'fail',
        remark: a.remark,
        photos: a.photos
      })),
      status: 'in_progress'
    }

    let response
    if (currentRecord.value) {
      response = await updateRecord(currentRecord.value.id, recordData)
    } else {
      response = await createRecord(recordData)
    }

    if (response.code === 0) {
      currentRecord.value = response.data
      ElMessage.success('草稿已保存')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleSubmitAll = async () => {
  const incompleteItems = templateItems.value.filter(
    item => item.required && !answers.value[item.id]?.completed
  )

  if (incompleteItems.length > 0) {
    ElMessage.warning(`还有 ${incompleteItems.length} 项必查项未完成，请先完成所有必查项`)
    return
  }

  try {
    await ElMessageBox.confirm('确定要提交所有检查结果吗？提交后将无法修改。', '提交确认', {
      confirmButtonText: '确定提交',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const recordData = {
      taskId,
      storeId: task.value?.storeIds?.[0],
      templateId: task.value?.templateId,
      items: Object.values(answers.value).map(a => ({
        itemId: a.itemId,
        score: a.score,
        fullScore: a.fullScore,
        value: a.passed ? 'pass' : 'fail',
        remark: a.remark,
        photos: a.photos
      })),
      totalScore: currentScore.value,
      passScore,
      passed: currentScore.value >= passScore,
      status: 'completed'
    }

    let response
    if (currentRecord.value) {
      response = await updateRecord(currentRecord.value.id, recordData)
    } else {
      response = await createRecord(recordData)
    }

    if (response.code === 0) {
      currentRecord.value = response.data
      ElMessage.success('检查结果已提交')
    }
  } catch {
    // 用户取消
  }
}

const handleCompleteTask = async () => {
  const incompleteItems = templateItems.value.filter(
    item => !answers.value[item.id]?.completed
  )

  if (incompleteItems.length > 0) {
    try {
      await ElMessageBox.confirm(
        `还有 ${incompleteItems.length} 项未完成，确定要结束任务吗？`,
        '结束确认',
        {
          confirmButtonText: '确定结束',
          cancelButtonText: '继续检查',
          type: 'warning'
        }
      )
    } catch {
      return
    }
  }

  try {
    await ElMessageBox.confirm('确定要完成本次巡检任务吗？', '完成确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await completeTask(taskId)
    if (response.code === 0) {
      ElMessage.success('巡检任务已完成')
      router.push(`/tasks/${taskId}`)
    }
  } catch {
    // 用户取消
  }
}

const handleBack = () => {
  router.back()
}

const getCategoryProgress = (category: string) => {
  const items = getItemsByCategory()[category] || []
  const completed = items.filter(item => answers.value[item.id]?.completed).length
  return {
    completed,
    total: items.length,
    percentage: items.length > 0 ? Math.round((completed / items.length) * 100) : 0
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getStoreName = () => {
  if (task.value?.stores && task.value.stores.length > 0) {
    return task.value.stores[0].name
  }
  return '未分配门店'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="inspection-container" v-loading="loading">
    <div class="top-bar">
      <div class="back-btn" @click="handleBack">
        <ArrowLeft :size="20" />
      </div>
      <div class="task-info">
        <h1 class="task-name">{{ task?.name || '加载中...' }}</h1>
        <div class="store-name">
          <MapPin :size="14" />
          {{ getStoreName() }}
        </div>
      </div>
      <div class="progress-info">
        <div class="progress-text">
          <span class="completed">{{ progress.completed }}</span>
          <span class="separator">/</span>
          <span class="total">{{ progress.total }}</span>
        </div>
        <div class="progress-label">已完成</div>
      </div>
    </div>

    <div v-if="isOffline" class="offline-banner">
      <WifiOff :size="18" />
      <span>当前处于离线模式，数据将在联网后自动同步</span>
    </div>

    <div class="location-card">
      <div class="location-header">
        <div class="location-title">
          <MapPin :size="18" class="location-icon" />
          <span>定位验证</span>
        </div>
        <el-tag
          :type="locationVerified ? 'success' : 'warning'"
          effect="light"
          round
          size="small"
        >
          {{ locationVerified ? '已验证' : '待验证' }}
        </el-tag>
      </div>
      <div class="location-body">
        <div class="coords">
          <span class="coord-item">经度: {{ currentLocation.longitude.toFixed(6) }}</span>
          <span class="coord-item">纬度: {{ currentLocation.latitude.toFixed(6) }}</span>
        </div>
        <div class="address">
          <MapPin :size="14" />
          <span>{{ currentLocation.address }}</span>
        </div>
        <div class="distance" :class="{ verified: locationVerified, warning: !locationVerified }">
          <AlertTriangle v-if="!locationVerified" :size="14" />
          <CheckCircle v-else :size="14" />
          <span>距离门店约 {{ currentLocation.distance }} 米</span>
          <span v-if="!locationVerified" class="warning-text">（超出巡检范围）</span>
          <span v-else class="verified-text">（在巡检范围内）</span>
        </div>
      </div>
    </div>

    <div class="score-summary">
      <div class="score-item">
        <div class="score-value current">{{ currentScore }}</div>
        <div class="score-label">当前得分</div>
      </div>
      <div class="score-divider"></div>
      <div class="score-item">
        <div class="score-value total">{{ totalScore }}</div>
        <div class="score-label">总分</div>
      </div>
      <div class="score-divider"></div>
      <div class="score-item">
        <div class="score-value pass">{{ passScore }}</div>
        <div class="score-label">及格分</div>
      </div>
      <div class="score-divider"></div>
      <div class="score-item">
        <div class="score-value percentage" :class="{ pass: currentScore >= passScore, fail: currentScore < passScore }">
          {{ progress.percentage }}%
        </div>
        <div class="score-label">完成率</div>
      </div>
    </div>

    <div class="checklist-container">
      <div
        v-for="(items, category) in getItemsByCategory()"
        :key="category"
        class="category-section"
      >
        <div class="category-header" @click="toggleCategory(category)">
          <div class="category-left">
            <component
              :is="expandedCategories[category] ? ChevronDown : ChevronRight"
              :size="20"
              class="expand-icon"
            />
            <span class="category-name">{{ category }}</span>
            <el-tag size="small" type="info" effect="plain">
              {{ getCategoryProgress(category).completed }}/{{ items.length }}
            </el-tag>
          </div>
          <div class="category-progress">
            <el-progress
              :percentage="getCategoryProgress(category).percentage"
              :stroke-width="6"
              :color="getCategoryProgress(category).percentage === 100 ? '#10B981' : '#165DFF'"
              style="width: 100px"
              :format="() => ''"
            />
          </div>
        </div>

        <div v-show="expandedCategories[category]" class="category-items">
          <div
            v-for="item in items"
            :key="item.id"
            class="check-item"
            :class="{ completed: answers[item.id]?.completed }"
          >
            <div class="item-header" @click="toggleItem(item.id)">
              <div class="item-left">
                <div
                  class="check-status"
                  :class="{ checked: answers[item.id]?.completed }"
                >
                  <CheckCircle v-if="answers[item.id]?.completed" :size="18" />
                  <span v-else class="check-number">{{ items.indexOf(item) + 1 }}</span>
                </div>
                <div class="item-info">
                  <div class="item-title">
                    {{ item.title }}
                    <el-tag v-if="item.required" size="small" type="danger" effect="plain" class="required-tag">
                      必查
                    </el-tag>
                  </div>
                  <div class="item-tags">
                    <el-tag size="small" type="info" effect="plain">
                      {{ item.scoreWeight }} 分
                    </el-tag>
                    <el-tag size="small" type="warning" effect="plain">
                      <Camera :size="12" />
                      需拍照
                    </el-tag>
                  </div>
                </div>
              </div>
              <div class="item-right">
                <div v-if="answers[item.id]?.completed" class="item-score-preview">
                  <span :class="{ pass: answers[item.id]?.passed, fail: !answers[item.id]?.passed }">
                    {{ answers[item.id]?.score }}
                  </span>
                  <span class="full-score">/{{ item.scoreWeight }}</span>
                </div>
                <component
                  :is="expandedItems[item.id] ? ChevronDown : ChevronRight"
                  :size="18"
                  class="expand-icon"
                />
              </div>
            </div>

            <div v-show="expandedItems[item.id]" class="item-detail">
              <div class="detail-section">
                <div class="section-title">
                  <Flag :size="16" />
                  打分
                </div>
                <ScoreSlider
                  v-model="answers[item.id]?.score"
                  :max-score="item.scoreWeight"
                  :pass-score="Math.round(item.scoreWeight * 0.6)"
                  @update:model-value="handleScoreChange(item.id, $event)"
                />
              </div>

              <div class="detail-section">
                <div class="section-title">
                  <CheckCircle :size="16" />
                  检查结果
                </div>
                <div class="result-row">
                  <span class="result-label">是否合格：</span>
                  <el-switch
                    v-model="answers[item.id]?.passed"
                    :active-text="'合格'"
                    :inactive-text="'不合格'"
                    inline-prompt
                    @change="handlePassedChange(item.id, $event)"
                  />
                </div>
                <el-input
                  v-model="answers[item.id]?.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入检查结果说明..."
                  maxlength="500"
                  show-word-limit
                  @input="handleRemarkChange(item.id, ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div class="detail-section">
                <div class="section-title">
                  <Camera :size="16" />
                  现场照片
                </div>
                <PhotoUpload
                  v-model="answers[item.id]?.photos"
                  :max-count="5"
                  type="inspection"
                  @update:model-value="handlePhotosChange(item.id, $event)"
                />
              </div>

              <div class="detail-actions">
                <el-button size="large" @click="openIssueDialog(item)">
                  <Plus :size="16" />
                  登记问题
                </el-button>
                <el-button
                  type="primary"
                  size="large"
                  @click="markItemComplete(item.id)"
                >
                  <Save :size="16" />
                  保存此项
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <el-button size="large" @click="handleSaveDraft">
        <Save :size="18" />
        暂存
      </el-button>
      <el-button type="primary" size="large" @click="handleSubmitAll">
        <Send :size="18" />
        提交全部
      </el-button>
      <el-button type="success" size="large" @click="handleCompleteTask">
        <CheckCircle :size="18" />
        完成任务
      </el-button>
    </div>

    <el-dialog
      v-model="issueDialogVisible"
      title="快速登记问题"
      width="500px"
      class="issue-dialog"
    >
      <el-form label-width="80px">
        <el-form-item label="问题描述">
          <el-input
            v-model="issueForm.description"
            type="textarea"
            :rows="3"
            placeholder="请描述发现的问题"
          />
        </el-form-item>
        <el-form-item label="严重程度">
          <el-radio-group v-model="issueForm.level">
            <el-radio value="low">低</el-radio>
            <el-radio value="medium">中</el-radio>
            <el-radio value="high">高</el-radio>
            <el-radio value="critical">严重</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="issueDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateIssue">确认登记</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.inspection-container {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 100px;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(22, 93, 255, 0.3);
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.task-info {
  flex: 1;
  overflow: hidden;
}

.task-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.9;
}

.progress-info {
  text-align: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 12px;
}

.progress-text {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.progress-text .completed {
  font-size: 24px;
  font-weight: 700;
}

.progress-text .separator {
  font-size: 16px;
  opacity: 0.7;
}

.progress-text .total {
  font-size: 16px;
  opacity: 0.8;
}

.progress-label {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 2px;
}

.offline-banner {
  background: #FFF7ED;
  color: #C2410C;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  border-bottom: 1px solid #FED7AA;
}

.location-card {
  background: white;
  margin: 16px;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.location-header {
  padding: 16px 20px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1E293B;
  font-size: 15px;
}

.location-icon {
  color: #165DFF;
}

.location-body {
  padding: 16px 20px;
}

.coords {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.coord-item {
  font-size: 13px;
  color: #64748B;
  font-family: 'SF Mono', monospace;
  background: #F8FAFC;
  padding: 4px 10px;
  border-radius: 6px;
}

.address {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #334155;
  margin-bottom: 12px;
  line-height: 1.5;
}

.address svg {
  margin-top: 2px;
  flex-shrink: 0;
  color: #64748B;
}

.distance {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
}

.distance.verified {
  background: #F0FDF4;
  color: #166534;
}

.distance.warning {
  background: #FFFBEB;
  color: #92400E;
}

.warning-text {
  color: #DC2626;
  font-weight: 500;
}

.verified-text {
  color: #16A34A;
  font-weight: 500;
}

.score-summary {
  background: white;
  margin: 0 16px 16px;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.score-item {
  text-align: center;
}

.score-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.score-value.current {
  color: #165DFF;
}

.score-value.total {
  color: #64748B;
}

.score-value.pass {
  color: #F59E0B;
}

.score-value.percentage.pass {
  color: #10B981;
}

.score-value.percentage.fail {
  color: #EF4444;
}

.score-label {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
}

.score-divider {
  width: 1px;
  height: 40px;
  background: #E2E8F0;
}

.checklist-container {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.category-header {
  padding: 16px 20px;
  background: #F8FAFC;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.category-header:hover {
  background: #F1F5F9;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-name {
  font-weight: 600;
  color: #1E293B;
  font-size: 15px;
}

.expand-icon {
  color: #64748B;
  transition: transform 0.2s;
}

.category-items {
  padding: 0 12px 12px;
}

.check-item {
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  margin-top: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.check-item.completed {
  border-color: #86EFAC;
  background: #F0FDF4;
}

.check-item:hover {
  border-color: #165DFF;
}

.item-header {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.check-status {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  flex-shrink: 0;
}

.check-status.checked {
  background: #10B981;
  color: white;
}

.item-info {
  flex: 1;
  overflow: hidden;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.4;
}

.required-tag {
  flex-shrink: 0;
}

.item-tags {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.item-score-preview {
  font-family: 'SF Mono', monospace;
  font-weight: 600;
}

.item-score-preview .pass {
  color: #10B981;
}

.item-score-preview .fail {
  color: #EF4444;
}

.item-score-preview .full-score {
  color: #94A3B8;
  font-weight: 400;
}

.item-detail {
  padding: 0 16px 16px;
  border-top: 1px solid #F1F5F9;
  background: #FAFAFA;
}

.detail-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 12px;
}

.section-title svg {
  color: #165DFF;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.result-label {
  font-size: 14px;
  color: #64748B;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #E2E8F0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  border-top: 1px solid #E2E8F0;
}

.bottom-bar .el-button {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 15px;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

@media (max-width: 768px) {
  .top-bar {
    padding: 12px 16px;
  }

  .task-name {
    font-size: 16px;
  }

  .location-card,
  .score-summary {
    margin: 12px;
  }

  .checklist-container {
    padding: 0 12px;
  }

  .coords {
    flex-wrap: wrap;
    gap: 8px;
  }

  .score-summary {
    padding: 16px 12px;
  }

  .score-value {
    font-size: 24px;
  }

  .bottom-bar {
    padding: 12px 16px;
  }

  .bottom-bar .el-button {
    height: 44px;
    font-size: 14px;
  }
}
</style>
