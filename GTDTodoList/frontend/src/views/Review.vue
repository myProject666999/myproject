<template>
    <div class="review-page">
        <div class="page-header">
            <h2>每周回顾</h2>
            <el-button type="primary" @click="generateNewReview">
                <el-icon><Refresh /></el-icon>
                生成本周回顾
            </el-button>
        </div>

        <el-card v-if="currentReview" class="current-review-card">
            <div class="review-header">
                <h3>本周回顾</h3>
                <span class="review-date">{{ formatDate(currentReview.reviewDate) }}</span>
            </div>
            <div class="review-period">
                统计周期：{{ formatDate(currentReview.weekStartDate) }} - {{ formatDate(currentReview.weekEndDate) }}
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <el-icon class="stat-icon completed"><Check /></el-icon>
                    <div class="stat-info">
                        <span class="stat-value">{{ currentReview.tasksCompleted }}</span>
                        <span class="stat-label">已完成任务</span>
                    </div>
                </div>
                <div class="stat-item">
                    <el-icon class="stat-icon created"><Plus /></el-icon>
                    <div class="stat-info">
                        <span class="stat-value">{{ currentReview.tasksCreated }}</span>
                        <span class="stat-label">新建任务</span>
                    </div>
                </div>
                <div class="stat-item">
                    <el-icon class="stat-icon processed"><FolderChecked /></el-icon>
                    <div class="stat-info">
                        <span class="stat-value">{{ currentReview.inboxProcessed }}</span>
                        <span class="stat-label">收件箱处理</span>
                    </div>
                </div>
                <div class="stat-item">
                    <el-icon class="stat-icon active"><Collection /></el-icon>
                    <div class="stat-info">
                        <span class="stat-value">{{ currentReview.projectsActive }}</span>
                        <span class="stat-label">活跃项目</span>
                    </div>
                </div>
            </div>

            <el-form :model="reviewForm" label-width="100px" class="review-form">
                <el-form-item label="本周总结">
                    <el-input
                        v-model="reviewForm.summary"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入本周的工作总结和反思..."
                    />
                </el-form-item>
                <el-form-item label="下周目标">
                    <el-input
                        v-model="reviewForm.nextWeekGoals"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入下周的计划和目标..."
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="saveReview">保存回顾</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <div class="history-section">
            <h3>历史回顾</h3>
            <div v-if="reviews.length === 0" class="empty-history">
                <el-empty description="暂无历史回顾记录" />
            </div>
            <div v-else class="review-list">
                <div
                    v-for="review in reviews"
                    :key="review.id"
                    class="review-item"
                >
                    <div class="review-item-header">
                        <span class="review-item-date">{{ formatDate(review.reviewDate) }}</span>
                        <span class="review-item-period">
                            {{ formatDate(review.weekStartDate) }} - {{ formatDate(review.weekEndDate) }}
                        </span>
                    </div>
                    <div class="review-item-stats">
                        <span>完成 {{ review.tasksCompleted }} 项</span>
                        <span>新建 {{ review.tasksCreated }} 项</span>
                    </div>
                    <div v-if="review.summary" class="review-item-summary">
                        <strong>总结：</strong>{{ review.summary }}
                    </div>
                    <div v-if="review.nextWeekGoals" class="review-item-goals">
                        <strong>目标：</strong>{{ review.nextWeekGoals }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { getReviews, generateReview, saveReview } from '@/api/review'

const store = useStore()
const userId = store.state.userId

const reviews = ref([])
const currentReview = ref(null)

const reviewForm = ref({
    summary: '',
    nextWeekGoals: ''
})

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('zh-CN')
}

const loadReviews = async () => {
    const res = await getReviews(userId)
    reviews.value = res
}

const generateNewReview = async () => {
    const res = await generateReview(userId)
    currentReview.value = res
    reviewForm.value = {
        summary: '',
        nextWeekGoals: ''
    }
}

const saveReview = async () => {
    await saveReview({
        ...currentReview.value,
        summary: reviewForm.value.summary,
        nextWeekGoals: reviewForm.value.nextWeekGoals
    })
    ElMessage.success('回顾保存成功')
    loadReviews()
    currentReview.value = null
}

onMounted(() => {
    loadReviews()
})
</script>

<style scoped>
.review-page {
    max-width: 900px;
    margin: 0 auto;
}
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.page-header h2 {
    margin: 0;
    color: #333;
}
.current-review-card {
    margin-bottom: 30px;
    border-radius: 8px;
}
.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.review-header h3 {
    margin: 0;
    color: #333;
}
.review-date {
    color: #666;
    font-size: 14px;
}
.review-period {
    color: #999;
    font-size: 14px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
}
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}
.stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
}
.stat-icon {
    font-size: 28px;
    padding: 8px;
    border-radius: 8px;
}
.stat-icon.completed {
    color: #67c23a;
    background: #f0f9eb;
}
.stat-icon.created {
    color: #409eff;
    background: #ecf5ff;
}
.stat-icon.processed {
    color: #e6a23c;
    background: #fdf6ec;
}
.stat-icon.active {
    color: #f56c6c;
    background: #fef0f0;
}
.stat-info {
    display: flex;
    flex-direction: column;
}
.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}
.stat-label {
    font-size: 12px;
    color: #999;
}
.review-form {
    margin-top: 20px;
}
.history-section h3 {
    margin-bottom: 16px;
    color: #333;
}
.empty-history {
    padding: 40px 0;
}
.review-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.review-item {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.review-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.review-item-date {
    font-weight: bold;
    color: #333;
}
.review-item-period {
    font-size: 12px;
    color: #999;
}
.review-item-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
    font-size: 14px;
    color: #666;
}
.review-item-summary,
.review-item-goals {
    font-size: 14px;
    color: #666;
    margin-top: 8px;
    line-height: 1.5;
}
</style>
