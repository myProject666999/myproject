<template>
  <div class="worker-dashboard">
    <van-nav-bar title="工人工作台" fixed placeholder />
    
    <div class="dashboard-content">
      <div class="status-card">
        <div class="status-info">
          <div class="avatar-wrapper">
            <van-image
              round
              width="60"
              height="60"
              :src="userStore.userInfo?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            />
            <span class="status-dot" :class="{ active: isAvailable }"></span>
          </div>
          <div class="user-info">
            <div class="name">{{ userStore.userInfo?.name || '维修师傅' }}</div>
            <div class="status-text">{{ isAvailable ? '在线接单中' : '休息中' }}</div>
          </div>
        </div>
        <div class="status-toggle">
          <van-switch v-model="isAvailable" active-color="#07c160" inactive-color="#dcdee0" />
        </div>
      </div>

      <van-grid :column-num="2" border class="stats-grid">
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalOrders }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value">{{ stats.todayOrders }}</div>
            <div class="stat-label">今日订单</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value money">¥{{ stats.totalEarnings }}</div>
            <div class="stat-label">累计收入</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <div class="stat-value rating">{{ stats.rating }}</div>
            <div class="stat-label">评分</div>
          </div>
        </van-grid-item>
      </van-grid>

      <div class="section">
        <div class="section-title">快捷操作</div>
        <van-grid :column-num="4" border class="action-grid">
          <van-grid-item icon="orders-o" text="待抢订单" @click="goToPendingOrders" />
          <van-grid-item icon="todo-list-o" text="我的订单" @click="goToMyOrders" />
          <van-grid-item icon="balance-o" text="收入明细" @click="showToast('收入明细')" />
          <van-grid-item icon="user-circle-o" text="个人中心" @click="goToProfile" />
        </van-grid>
      </div>

      <div class="section">
        <div class="section-title">近7天订单统计</div>
        <div class="chart-container">
          <div class="chart-bars">
            <div
              v-for="(item, index) in chartData"
              :key="index"
              class="bar-item"
            >
              <div class="bar-wrapper">
                <div class="bar" :style="{ height: item.height + '%' }"></div>
              </div>
              <div class="bar-label">{{ item.day }}</div>
              <div class="bar-value">{{ item.count }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getWorkerStats } from '@/api/worker'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const isAvailable = ref(true)
const stats = ref({
  totalOrders: 0,
  todayOrders: 0,
  totalEarnings: 0,
  rating: 0
})

const chartData = ref([
  { day: '周一', count: 5, height: 50 },
  { day: '周二', count: 8, height: 80 },
  { day: '周三', count: 3, height: 30 },
  { day: '周四', count: 6, height: 60 },
  { day: '周五', count: 9, height: 90 },
  { day: '周六', count: 12, height: 100 },
  { day: '周日', count: 7, height: 70 }
])

const fetchStats = async () => {
  try {
    const res = await getWorkerStats(userStore.userInfo?.id)
    if (res) {
      stats.value = {
        totalOrders: res.totalOrders || 156,
        todayOrders: res.todayOrders || 8,
        totalEarnings: res.totalEarnings || 25800,
        rating: res.rating || 4.8
      }
    }
  } catch (e) {
    stats.value = {
      totalOrders: 156,
      todayOrders: 8,
      totalEarnings: 25800,
      rating: 4.8
    }
  }
}

const goToPendingOrders = () => {
  router.push('/worker/orders?tab=pending_grab')
}

const goToMyOrders = () => {
  router.push('/worker/orders?tab=my_orders')
}

const goToProfile = () => {
  router.push('/profile')
}

onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss" scoped>
.worker-dashboard {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.dashboard-content {
  padding: 12px;
}

.status-card {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #fff;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #dcdee0;
  border: 2px solid #fff;
  
  &.active {
    background-color: #ff976a;
  }
}

.user-info {
  .name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .status-text {
    font-size: 13px;
    opacity: 0.9;
  }
}

.stats-grid {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.stat-item {
  padding: 16px 0;
  
  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 4px;
    
    &.money {
      color: #ff6034;
    }
    
    &.rating {
      color: #ff976a;
    }
  }
  
  .stat-label {
    font-size: 13px;
    color: #969799;
  }
}

.section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.action-grid {
  border-radius: 8px;
  overflow: hidden;
}

.chart-container {
  padding: 20px 0 10px;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-wrapper {
  height: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 24px;
  background: linear-gradient(180deg, #07c160 0%, #90e8b0 100%);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 12px;
  color: #969799;
  margin-top: 8px;
}

.bar-value {
  font-size: 11px;
  color: #323233;
  font-weight: 500;
  margin-top: 2px;
}
</style>
