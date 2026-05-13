<template>
  <div class="page-container">
    <van-nav-bar title="回收员端" fixed placeholder>
      <template #right>
        <van-icon name="log-out" size="22" @click="logout" />
      </template>
    </van-nav-bar>

    <div class="stats-card">
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-value">{{ stats.pendingCount }}</div>
          <div class="stat-label">待接单</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.acceptedCount }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-item" @click="goTasks('PENDING')">
        <van-icon name="todo-list-o" size="28" color="#07c160" />
        <span>待接单</span>
      </div>
      <div class="action-item" @click="goTasks('ACCEPTED')">
        <van-icon name="location-o" size="28" color="#1989fa" />
        <span>进行中</span>
      </div>
      <div class="action-item" @click="goTasks('COMPLETED')">
        <van-icon name="checked" size="28" color="#969799" />
        <span>已完成</span>
      </div>
    </div>

    <div class="section-title">最新任务</div>
    <div class="task-list">
      <div
        v-for="order in pendingOrders"
        :key="order.id"
        class="task-card"
        @click="goDetail(order.id)"
      >
        <div class="task-header">
          <span class="order-no">{{ order.orderNo }}</span>
          <van-tag type="warning">待接单</van-tag>
        </div>
        <div class="task-body">
          <div class="info-row">
            <span class="label">预估价格：</span>
            <span class="price">¥{{ order.estimatedPrice }}</span>
          </div>
          <div class="info-row">
            <span class="label">预约时间：</span>
            <span>{{ order.appointmentTime }}</span>
          </div>
          <div class="info-row" v-if="order.description">
            <span class="label">描述：</span>
            <span>{{ order.description }}</span>
          </div>
        </div>
        <van-button type="primary" size="small" block @click.stop="acceptOrder(order.id)">
          立即接单
        </van-button>
      </div>
      <van-empty v-if="pendingOrders.length === 0" description="暂无待接任务" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { collectorApi } from '@/api'

const router = useRouter()

const stats = ref({
  pendingCount: 0,
  acceptedCount: 0,
  completedCount: 0
})

const pendingOrders = ref([])

const loadStats = async () => {
  try {
    const [pending, accepted, completed] = await Promise.all([
      collectorApi.orders('PENDING'),
      collectorApi.orders('ACCEPTED'),
      collectorApi.orders('COMPLETED')
    ])
    stats.value.pendingCount = (pending.data || []).length
    stats.value.acceptedCount = (accepted.data || []).length
    stats.value.completedCount = (completed.data || []).length
    pendingOrders.value = (pending.data || []).slice(0, 5)
  } catch (e) {
  }
}

const acceptOrder = async (id) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要接此订单吗？'
    })
    await collectorApi.accept(id)
    showToast('接单成功')
    loadStats()
  } catch {}
}

const goTasks = (status) => {
  router.push({ path: '/collector/tasks', query: { status } })
}

const goDetail = (id) => {
  router.push(`/order-detail/${id}`)
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userId')
  router.push('/login')
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="less" scoped>
.stats-card {
  background: linear-gradient(135deg, #07c160 0%, #69d17c 100%);
  margin: 12px;
  padding: 24px;
  border-radius: 16px;
  color: white;
  
  .stats-row {
    display: flex;
    justify-content: space-around;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 13px;
        opacity: 0.9;
      }
    }
  }
}

.quick-actions {
  display: flex;
  background: white;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px 0;
  
  .action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }
}

.section-title {
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
}

.task-list {
  padding: 0 12px 30px;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebedf0;
    margin-bottom: 12px;
    
    .order-no {
      font-size: 13px;
      color: #969799;
    }
  }
  
  .task-body {
    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
      
      .label {
        color: #969799;
        min-width: 70px;
      }
      
      .price {
        color: #07c160;
        font-weight: 600;
      }
    }
  }
}
</style>
