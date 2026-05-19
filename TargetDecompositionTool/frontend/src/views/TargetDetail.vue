<template>
  <div class="target-detail-page" v-loading="loading">
    <el-button :icon="ArrowLeft" @click="goBack" class="back-btn">返回</el-button>
    
    <div class="detail-header card mb-20">
      <div class="header-left">
        <h2>{{ target.title }}</h2>
        <div class="meta">
          <el-tag :type="getPriorityType(target.priority)" size="small">
            {{ getPriorityText(target.priority) }}优先级
          </el-tag>
          <el-tag :type="getStatusType(target.status)" size="small" class="ml-10">
            {{ getStatusText(target.status) }}
          </el-tag>
          <span class="date" v-if="target.startDate">
            <el-icon><Calendar /></el-icon>
            {{ target.startDate }} ~ {{ target.endDate }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <div class="card mb-20">
          <div class="card-title">目标描述</div>
          <p class="description">{{ target.description || '暂无描述' }}</p>
        </div>

        <div class="card mb-20">
          <div class="card-title flex-between">
            <span>进度跟踪</span>
            <el-button type="primary" text :icon="Plus" @click="showProgressDialog = true">
              更新进度
            </el-button>
          </div>
          <el-progress
            :percentage="target.progress"
            :stroke-width="20"
            :color="getProgressColor(target.progress)"
            class="main-progress"
          />
          <div class="progress-info">
            <span>当前进度: {{ target.progress }}%</span>
          </div>
        </div>

        <div class="card">
          <div class="card-title flex-between">
            <span>里程碑</span>
            <el-button type="primary" text :icon="Plus" @click="showMilestoneDialog = true">
              添加里程碑
            </el-button>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="item in milestones"
              :key="item.id"
              :timestamp="item.dueDate"
              :type="item.isCompleted ? 'success' : 'primary'"
              :icon="item.isCompleted ? CircleCheck : Clock"
            >
              <div class="milestone-item">
                <div class="milestone-title">
                  <span :class="{ completed: item.isCompleted }">{{ item.title }}</span>
                  <el-switch
                    v-model="item.isCompleted"
                    size="small"
                    @change="toggleMilestone(item)"
                  />
                </div>
                <p class="milestone-desc" v-if="item.description">{{ item.description }}</p>
              </div>
            </el-timeline-item>
            <el-empty v-if="milestones.length === 0" description="暂无里程碑" />
          </el-timeline>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card mb-20">
          <div class="card-title">子目标</div>
          <div class="children-list">
            <div
              v-for="child in children"
              :key="child.id"
              class="child-item"
              @click="goToDetail(child.id)"
            >
              <div class="child-title">{{ child.title }}</div>
              <el-progress
                :percentage="child.progress"
                :stroke-width="6"
                :color="getProgressColor(child.progress)"
              />
            </div>
            <el-empty v-if="children.length === 0" description="暂无子目标" :image-size="80" />
          </div>
        </div>

        <div class="card">
          <div class="card-title flex-between">
            <span>复盘记录</span>
            <el-button type="primary" text :icon="Plus" @click="showReviewDialog = true">
              新增复盘
            </el-button>
          </div>
          <div class="review-list">
            <div v-for="item in reviews" :key="item.id" class="review-item">
              <div class="review-header">
                <span class="review-title">{{ item.title }}</span>
                <span class="review-date">{{ item.reviewDate }}</span>
              </div>
              <div class="review-progress">
                <span>{{ item.progressBefore }}% → {{ item.progressAfter }}%</span>
              </div>
              <p class="review-content" v-if="item.content">{{ item.content }}</p>
            </div>
            <el-empty v-if="reviews.length === 0" description="暂无复盘记录" :image-size="80" />
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="showProgressDialog" title="更新进度" width="400px">
      <el-form label-width="80px">
        <el-form-item label="进度">
          <el-slider v-model="progressForm.progress" :min="0" :max="100" :step="5" show-input />
        </el-form-item>
        <el-form-item label="变更原因">
          <el-input v-model="progressForm.reason" type="textarea" :rows="3" placeholder="请输入变更原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProgressDialog = false">取消</el-button>
        <el-button type="primary" @click="updateProgress">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showMilestoneDialog" title="添加里程碑" width="400px">
      <el-form :model="milestoneForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="milestoneForm.title" placeholder="请输入里程碑标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="milestoneForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="milestoneForm.dueDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMilestoneDialog = false">取消</el-button>
        <el-button type="primary" @click="addMilestone">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showReviewDialog" title="新增复盘" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="reviewForm.title" placeholder="请输入复盘标题" />
        </el-form-item>
        <el-form-item label="复盘日期">
          <el-date-picker v-model="reviewForm.reviewDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="进度变化">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input-number v-model="reviewForm.progressBefore" :min="0" :max="100" placeholder="之前" />
            </el-col>
            <el-col :span="12">
              <el-input-number v-model="reviewForm.progressAfter" :min="0" :max="100" placeholder="之后" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="复盘内容">
          <el-input v-model="reviewForm.content" type="textarea" :rows="3" placeholder="请输入复盘内容" />
        </el-form-item>
        <el-form-item label="遇到问题">
          <el-input v-model="reviewForm.problems" type="textarea" :rows="2" placeholder="请输入遇到的问题" />
        </el-form-item>
        <el-form-item label="解决方案">
          <el-input v-model="reviewForm.solutions" type="textarea" :rows="2" placeholder="请输入解决方案" />
        </el-form-item>
        <el-form-item label="下一步计划">
          <el-input v-model="reviewForm.nextSteps" type="textarea" :rows="2" placeholder="请输入下一步计划" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReviewDialog = false">取消</el-button>
        <el-button type="primary" @click="addReview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Calendar,
  Plus,
  CircleCheck,
  Clock
} from '@element-plus/icons-vue'
import {
  getTargetDetail,
  updateTarget,
  getMilestoneList,
  addMilestone as apiAddMilestone,
  updateMilestone,
  getReviewList,
  addReview as apiAddReview
} from '@/api/target'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const target = ref({})
const children = ref([])
const milestones = ref([])
const reviews = ref([])

const showProgressDialog = ref(false)
const showMilestoneDialog = ref(false)
const showReviewDialog = ref(false)

const progressForm = reactive({
  progress: 0,
  reason: ''
})

const milestoneForm = reactive({
  title: '',
  description: '',
  dueDate: ''
})

const reviewForm = reactive({
  title: '',
  reviewDate: '',
  progressBefore: 0,
  progressAfter: 0,
  content: '',
  problems: '',
  solutions: '',
  nextSteps: ''
})

const goBack = () => {
  router.back()
}

const goToDetail = (id) => {
  router.push(`/target/${id}`)
}

const getPriorityType = (priority) => {
  const types = { 1: 'danger', 2: 'warning', 3: 'info' }
  return types[priority] || 'info'
}

const getPriorityText = (priority) => {
  const texts = { 1: '高', 2: '中', 3: '低' }
  return texts[priority] || '未知'
}

const getStatusType = (status) => {
  const types = { 1: 'success', 2: 'primary', 3: 'warning', 4: 'info' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 1: '进行中', 2: '已完成', 3: '已暂停', 4: '已归档' }
  return texts[status] || '未知'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#10b981'
  if (progress >= 50) return '#3b82f6'
  if (progress >= 20) return '#f59e0b'
  return '#ef4444'
}

const handleEdit = () => {
  ElMessage.info('编辑功能开发中')
}

const loadData = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const data = await getTargetDetail(id)
    target.value = data
    children.value = data.children || []
    milestones.value = await getMilestoneList(id)
    reviews.value = await getReviewList(id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const updateProgress = async () => {
  try {
    await updateTarget(target.value.id, { progress: progressForm.progress })
    target.value.progress = progressForm.progress
    ElMessage.success('更新成功')
    showProgressDialog.value = false
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

const addMilestone = async () => {
  if (!milestoneForm.title) {
    ElMessage.warning('请输入标题')
    return
  }
  try {
    await apiAddMilestone({
      ...milestoneForm,
      targetId: target.value.id
    })
    ElMessage.success('添加成功')
    showMilestoneDialog.value = false
    milestoneForm.title = ''
    milestoneForm.description = ''
    milestoneForm.dueDate = ''
    milestones.value = await getMilestoneList(target.value.id)
  } catch (e) {
    ElMessage.error('添加失败')
  }
}

const toggleMilestone = async (item) => {
  try {
    await updateMilestone(item.id, { isCompleted: item.isCompleted ? 1 : 0 })
    ElMessage.success('更新成功')
  } catch (e) {
    item.isCompleted = !item.isCompleted
    ElMessage.error('更新失败')
  }
}

const addReview = async () => {
  if (!reviewForm.title) {
    ElMessage.warning('请输入标题')
    return
  }
  try {
    await apiAddReview({
      ...reviewForm,
      targetId: target.value.id
    })
    ElMessage.success('添加成功')
    showReviewDialog.value = false
    Object.assign(reviewForm, {
      title: '',
      reviewDate: '',
      progressBefore: 0,
      progressAfter: 0,
      content: '',
      problems: '',
      solutions: '',
      nextSteps: ''
    })
    reviews.value = await getReviewList(target.value.id)
  } catch (e) {
    ElMessage.error('添加失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.target-detail-page {
  min-height: 100%;
}

.back-btn {
  margin-bottom: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ml-10 {
  margin-left: 10px;
}

.date {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
}

.date .el-icon {
  margin-right: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.main-progress {
  margin-bottom: 10px;
}

.progress-info {
  color: #909399;
  font-size: 14px;
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.milestone-title {
  font-weight: 500;
  color: #303133;
}

.milestone-title.completed {
  text-decoration: line-through;
  color: #909399;
}

.milestone-desc {
  color: #909399;
  font-size: 13px;
  margin: 4px 0 0 0;
}

.child-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.child-item:hover {
  background: #ebeef5;
}

.child-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.review-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.review-title {
  font-weight: 500;
  color: #303133;
}

.review-date {
  color: #909399;
  font-size: 12px;
}

.review-progress {
  color: #3b82f6;
  font-size: 13px;
  margin-bottom: 4px;
}

.review-content {
  color: #606266;
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}
</style>
