<template>
  <div class="credit-page">
    <div class="page-header">
      <h2 class="page-title">信用评价</h2>
    </div>

    <el-card class="credit-score-card" shadow="never">
      <div class="score-container">
        <el-progress
          type="circle"
          :percentage="creditScore"
          :width="160"
          :stroke-width="12"
          :color="scoreColor"
          :show-text="false"
        />
        <div class="score-inner">
          <div class="score-value">{{ creditScore }}</div>
          <div class="score-label">信用分</div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-value">{{ fiveStarRatio }}%</div>
          <div class="stat-label">5星好评率</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ averageRating }}</div>
          <div class="stat-label">平均评分</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ totalReviews }}</div>
          <div class="stat-label">累计评价</div>
        </div>
      </div>
    </el-card>

    <el-card class="reviews-card" shadow="never">
      <h3 class="card-title">收到的评价</h3>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="reviews.length === 0" class="empty-container">
        <el-empty description="暂无评价" />
      </div>

      <div v-else class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <el-avatar :size="40" :src="review.reviewer?.avatar">
              {{ review.reviewer?.nickname?.charAt(0) }}
            </el-avatar>
            <div class="reviewer-info">
              <div class="reviewer-name">{{ review.reviewer?.nickname }}</div>
              <el-rate :model-value="review.rating" disabled :max="5" />
            </div>
            <div class="review-date">{{ formatDate(review.created_at) }}</div>
          </div>

          <p v-if="review.content" class="review-content">
            {{ review.content }}
          </p>

          <div v-if="review.tags" class="review-tags">
            <el-tag
              v-for="tag in review.tags.split(',')"
              :key="tag"
              size="small"
              effect="light"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="pagination-container" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { reviewApi } from '../api'
import type { Review } from '../types'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const reviews = ref<Review[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const creditScore = computed(() => userStore.user?.credit_score || 0)

const scoreColor = computed(() => {
  const score = creditScore.value
  if (score >= 90) return '#67C23A'
  if (score >= 70) return '#E6A23C'
  return '#F56C6C'
})

const fiveStarRatio = computed(() => {
  if (total.value === 0) return '0'
  const fiveStarCount = reviews.value.filter(r => r.rating === 5).length
  return ((fiveStarCount / total.value) * 100).toFixed(1)
})

const averageRating = computed(() => {
  if (reviews.value.length === 0) return '0'
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const totalReviews = computed(() => total.value)

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function fetchReviews() {
  if (!userStore.user) return

  loading.value = true
  try {
    const res = await reviewApi.getUserReviews(userStore.user.id, {
      page: currentPage.value,
      page_size: pageSize.value
    })
    if (res.code === 0 && res.data) {
      reviews.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
  } finally {
    loading.value = false
  }
}

function handlePageChange() {
  fetchReviews()
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.credit-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.credit-score-card {
  border-radius: 12px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #4F6EF7 100%);
  color: #fff;
}

.credit-score-card :deep(.el-card__body) {
  padding: 32px 24px;
}

.score-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.score-container :deep(.el-progress-circle) {
  color: #fff;
}

.score-container :deep(.el-progress-circle__track) {
  stroke: rgba(255, 255, 255, 0.2);
}

.score-inner {
  position: absolute;
  text-align: center;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.score-label {
  font-size: 13px;
  opacity: 0.9;
}

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-item .stat-value {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-item .stat-label {
  font-size: 13px;
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

.reviews-card {
  border-radius: 12px;
}

.reviews-card :deep(.el-card__body) {
  padding: 24px;
}

.card-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.loading-container {
  margin-bottom: 20px;
}

.empty-container {
  padding: 40px 0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.review-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.reviewer-info {
  flex: 1;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.review-date {
  font-size: 13px;
  color: #909399;
}

.review-content {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.review-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}
</style>
