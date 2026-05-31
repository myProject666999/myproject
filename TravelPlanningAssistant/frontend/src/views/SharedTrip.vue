<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" link @click="goHome">返回首页</el-button>
        <h2>{{ trip?.name || '分享的行程' }}</h2>
      </div>
      <el-tag type="success" :icon="View">共享行程</el-tag>
    </div>

    <div v-loading="loading" class="shared-trip">
      <div v-if="trip" class="trip-content">
        <div class="trip-info card">
          <h3>{{ trip.name }}</h3>
          <p v-if="trip.description" class="trip-desc">{{ trip.description }}</p>
          <div class="trip-meta">
            <span>
              <el-icon><Calendar /></el-icon>
              {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}
            </span>
            <span>
              <el-icon><LocationFilled /></el-icon>
              {{ getAttractionCount() }} 个景点
            </span>
          </div>
        </div>

        <div class="trip-days">
          <div v-for="(day, dayIndex) in sortedDays" :key="day.id" class="day-card card">
            <div class="day-header">
              <el-tag type="primary" size="large">Day {{ dayIndex + 1 }}</el-tag>
              <span class="day-date">{{ formatDate(day.date) }}</span>
            </div>

            <div v-if="day.attractions?.length > 0" class="attractions-list">
              <div
                v-for="attraction in sortedAttractions(day)"
                :key="attraction.id"
                class="attraction-item"
              >
                <div class="attraction-time">
                  {{ attraction.start_time || '--' }} - {{ attraction.end_time || '--' }}
                </div>
                <div class="attraction-content">
                  <div class="attraction-header">
                    <span class="attraction-type" :class="`type-${attraction.type}`">
                      {{ getTypeText(attraction.type) }}
                    </span>
                    <span class="attraction-name">{{ attraction.name }}</span>
                    <span v-if="attraction.cost" class="attraction-cost">¥{{ attraction.cost }}</span>
                  </div>
                  <p v-if="attraction.description" class="attraction-desc">{{ attraction.description }}</p>
                  <p v-if="attraction.address" class="attraction-address">
                    <el-icon><LocationFilled /></el-icon>
                    {{ attraction.address }}
                  </p>
                  <p v-if="attraction.notes" class="attraction-notes">
                    <el-icon><Notebook /></el-icon>
                    {{ attraction.notes }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="empty-day">暂无安排</div>
          </div>
        </div>

        <div v-if="budgets.length > 0" class="budget-section">
          <h3 class="section-title">预算信息</h3>
          <div class="budget-summary card">
            <div class="total-amount">
              <span>总预算</span>
              <strong>¥{{ totalBudget.toFixed(2) }}</strong>
            </div>
            <div class="budget-items">
              <div v-for="budget in budgets" :key="budget.id" class="budget-item">
                <span class="budget-category">{{ budget.category }}</span>
                <span class="budget-amount">¥{{ budget.amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <el-icon><WarningFilled /></el-icon>
        <p>找不到该行程或链接已失效</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Calendar, LocationFilled, View, Notebook, WarningFilled } from '@element-plus/icons-vue'
import { tripApi } from '../api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const trip = ref(null)

onMounted(async () => {
  await loadSharedTrip()
})

async function loadSharedTrip() {
  loading.value = true
  try {
    const res = await tripApi.getSharedTrip(route.params.token)
    trip.value = res.data
  } catch (e) {
    // error handled
  } finally {
    loading.value = false
  }
}

const sortedDays = computed(() => {
  if (!trip.value?.days) return []
  return [...trip.value.days].sort((a, b) => a.order_index - b.order_index)
})

const budgets = computed(() => trip.value?.budgets || [])

const totalBudget = computed(() => {
  return budgets.value.reduce((sum, b) => sum + (b.amount || 0), 0)
})

function sortedAttractions(day) {
  if (!day.attractions) return []
  return [...day.attractions].sort((a, b) => a.order_index - b.order_index)
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function getAttractionCount() {
  let count = 0
  trip.value?.days?.forEach(day => {
    count += day.attractions?.length || 0
  })
  return count
}

function getTypeText(type) {
  const map = { attraction: '景点', food: '餐饮', hotel: '住宿', transport: '交通' }
  return map[type] || type
}

function goHome() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shared-trip {
  .trip-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.trip-info {
  padding: 24px;

  h3 {
    font-size: 22px;
    color: #303133;
    margin: 0 0 12px 0;
  }

  .trip-desc {
    font-size: 14px;
    color: #606266;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .trip-meta {
    display: flex;
    gap: 24px;
    color: #909399;
    font-size: 14px;

    span {
      display: flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        color: #409eff;
      }
    }
  }
}

.trip-days {
  .day-card {
    padding: 20px;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .day-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;

      .day-date {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .empty-day {
      text-align: center;
      padding: 20px;
      color: #c0c4cc;
      font-size: 14px;
    }
  }
}

.attractions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .attraction-item {
    display: flex;
    align-items: flex-start;
    padding: 14px;
    background: #f5f7fa;
    border-radius: 8px;
    transition: background 0.3s;

    &:hover {
      background: #ecf5ff;
    }

    .attraction-time {
      width: 120px;
      color: #909399;
      font-size: 13px;
      flex-shrink: 0;
    }

    .attraction-content {
      flex: 1;
      min-width: 0;

      .attraction-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        flex-wrap: wrap;

        .attraction-type {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
          color: #fff;

          &.type-attraction { background: #409eff; }
          &.type-food { background: #67c23a; }
          &.type-hotel { background: #e6a23c; }
          &.type-transport { background: #f56c6c; }
        }

        .attraction-name {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
        }

        .attraction-cost {
          color: #f56c6c;
          font-weight: 500;
          font-size: 14px;
        }
      }

      .attraction-desc {
        font-size: 13px;
        color: #606266;
        margin-bottom: 6px;
        line-height: 1.5;
      }

      .attraction-address,
      .attraction-notes {
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;

        .el-icon {
          font-size: 12px;
          color: #409eff;
        }
      }
    }
  }
}

.budget-section {
  .budget-summary {
    padding: 24px;

    .total-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      span {
        font-size: 16px;
        color: #606266;
      }

      strong {
        font-size: 24px;
        color: #f56c6c;
      }
    }

    .budget-items {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }

    .budget-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 14px;
      background: #f5f7fa;
      border-radius: 6px;

      .budget-category {
        font-size: 14px;
        color: #606266;
      }

      .budget-amount {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }
    }
  }
}
</style>
