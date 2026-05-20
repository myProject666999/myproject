<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">好友评价</h1>
    </div>

    <div class="reviews-container">
      <div v-for="review in reviews" :key="review.id" class="review-card card">
        <div class="review-header">
          <div class="reviewer-info">
            <el-avatar :size="48" :icon="UserFilled" />
            <div class="reviewer-detail">
              <span class="reviewer-name">{{ review.userName }}</span>
              <span class="review-date">{{ formatDate(review.createTime) }}</span>
            </div>
          </div>
          <el-tag :type="getRepurchaseTagType(review.repurchaseIntention)" size="large">
            {{ review.repurchaseIntentionText }}
          </el-tag>
        </div>

        <div class="restaurant-link" @click="goToRestaurant(review.restaurantId)">
          <el-icon><Shop /></el-icon>
          <span>{{ review.restaurantName }}</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>

        <div class="review-scores">
          <div class="score-item">
            <span class="label">口味</span>
            <el-rate v-model="review.tasteScore" disabled size="small" />
            <span class="score">{{ review.tasteScore }}</span>
          </div>
          <div class="score-item">
            <span class="label">环境</span>
            <el-rate v-model="review.environmentScore" disabled size="small" />
            <span class="score">{{ review.environmentScore }}</span>
          </div>
          <div class="score-item">
            <span class="label">服务</span>
            <el-rate v-model="review.serviceScore" disabled size="small" />
            <span class="score">{{ review.serviceScore }}</span>
          </div>
          <div class="score-item overall">
            <span class="label">综合</span>
            <span class="overall-score">{{ review.overallScore }}</span>
          </div>
        </div>

        <p v-if="review.content" class="review-content">{{ review.content }}</p>
        
        <p v-if="review.visitDate" class="visit-date">
          <el-icon><Calendar /></el-icon> 用餐日期：{{ formatDate(review.visitDate) }}
        </p>
      </div>

      <el-empty v-if="reviews.length === 0" description="暂无好友评价" :image-size="120" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFriendReviews } from '@/api'

const router = useRouter()

const reviews = ref([])

const fetchReviews = async () => {
  try {
    const res = await getFriendReviews()
    reviews.value = res
  } catch (error) {
    console.error('Failed to fetch friend reviews:', error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getRepurchaseTagType = (intention) => {
  switch (intention) {
    case 1: return 'danger'
    case 2: return 'warning'
    case 3: return 'success'
    default: return 'info'
  }
}

const goToRestaurant = (id) => {
  router.push(`/restaurant/${id}`)
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped lang="scss">
.reviews-container {
  .review-card {
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .reviewer-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .reviewer-detail {
          display: flex;
          flex-direction: column;

          .reviewer-name {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }

          .review-date {
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
          }
        }
      }
    }

    .restaurant-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #ecf5ff;
      border-radius: 8px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s;
      color: #409eff;
      font-weight: 500;

      &:hover {
        background: #d9ecff;
      }

      .arrow {
        margin-left: auto;
      }
    }

    .review-scores {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 16px;

      .score-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          font-size: 13px;
          color: #606266;
          width: 36px;
        }

        .score {
          font-weight: 600;
          color: #f59e0b;
          font-size: 14px;
        }

        &.overall {
          padding-left: 16px;
          border-left: 2px solid #ebeef5;

          .label {
            width: auto;
            font-weight: 600;
            color: #303133;
          }

          .overall-score {
            font-size: 20px;
            font-weight: 700;
            color: #f59e0b;
          }
        }
      }
    }

    .review-content {
      margin: 0 0 12px;
      color: #606266;
      line-height: 1.8;
      font-size: 14px;
    }

    .visit-date {
      margin: 0;
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}
</style>
