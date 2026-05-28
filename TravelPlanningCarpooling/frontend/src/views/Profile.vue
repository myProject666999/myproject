<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="user-info">
        <el-avatar :size="80" :src="user?.avatar">
          {{ user?.nickname?.charAt(0) }}
        </el-avatar>
        <div class="user-details">
          <div class="user-name">
            {{ user?.nickname }}
            <el-tag v-if="user?.is_verified" type="success" size="small" effect="light">
              已认证
            </el-tag>
          </div>
          <div class="user-phone">{{ user?.phone }}</div>
          <div class="user-role">
            <el-tag :type="user?.role === 1 ? 'warning' : 'primary'" size="small" effect="light">
              {{ user?.role === 1 ? '车主' : '乘客' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon credit">
          <el-icon :size="28"><StarFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ user?.credit_score || 0 }}</div>
          <div class="stat-label">信用分</div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon rate">
          <el-icon :size="28"><CircleCheckFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ completionRate }}%</div>
          <div class="stat-label">完成率</div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon rides">
          <el-icon :size="28"><Van /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ user?.total_rides || 0 }}</div>
          <div class="stat-label">总行程数</div>
        </div>
      </el-card>
    </div>

    <el-card class="menu-card" shadow="never">
      <div class="menu-item" @click="goToOrders">
        <div class="menu-left">
          <div class="menu-icon orders">
            <el-icon :size="20"><Document /></el-icon>
          </div>
          <span class="menu-text">我的订单</span>
        </div>
        <el-icon :size="16" color="#C0C4CC"><ArrowRight /></el-icon>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="goToCredit">
        <div class="menu-left">
          <div class="menu-icon credit">
            <el-icon :size="20"><Star /></el-icon>
          </div>
          <span class="menu-text">信用评价</span>
        </div>
        <el-icon :size="16" color="#C0C4CC"><ArrowRight /></el-icon>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item" @click="goToVehicles">
        <div class="menu-left">
          <div class="menu-icon vehicles">
            <el-icon :size="20"><Van /></el-icon>
          </div>
          <span class="menu-text">车辆管理</span>
        </div>
        <el-icon :size="16" color="#C0C4CC"><ArrowRight /></el-icon>
      </div>
    </el-card>

    <el-button type="danger" plain class="logout-btn" @click="handleLogout">
      退出登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  StarFilled,
  CircleCheckFilled,
  Van,
  Document,
  Star,
  ArrowRight
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)

const completionRate = computed(() => {
  if (!user.value || user.value.total_rides === 0) return '0'
  const rate = (user.value.completed_rides / user.value.total_rides) * 100
  return rate.toFixed(1)
})

function goToOrders() {
  router.push('/orders')
}

function goToCredit() {
  router.push('/profile/credit')
}

function goToVehicles() {
  router.push('/profile/vehicles')
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    router.push('/login')
  } catch (error) {
    return
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  background: linear-gradient(135deg, #4F6EF7 0%, #667eea 100%);
  border-radius: 16px;
  padding: 32px 24px;
  margin-bottom: 24px;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name :deep(.el-tag) {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
}

.user-phone {
  font-size: 14px;
  opacity: 0.9;
}

.user-role :deep(.el-tag) {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  text-align: center;
}

.stat-card :deep(.el-card__body) {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.credit {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.stat-icon.rate {
  background: linear-gradient(135deg, #67C23A 0%, #4CAF50 100%);
}

.stat-icon.rides {
  background: linear-gradient(135deg, #409EFF 0%, #4F6EF7 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.menu-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.menu-card :deep(.el-card__body) {
  padding: 0 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  cursor: pointer;
  transition: opacity 0.2s;
}

.menu-item:hover {
  opacity: 0.7;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.menu-icon.orders {
  background: #409EFF;
}

.menu-icon.credit {
  background: #E6A23C;
}

.menu-icon.vehicles {
  background: #67C23A;
}

.menu-text {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.menu-divider {
  height: 1px;
  background: #EBEEF5;
}

.logout-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
}
</style>
