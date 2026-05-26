<template>
  <div class="profile-page">
    <van-nav-bar title="个人中心" fixed placeholder />
    
    <div class="profile-content">
      <div class="user-card">
        <div class="user-info">
          <van-image
            round
            width="70"
            height="70"
            :src="userStore.userInfo?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          />
          <div class="user-details">
            <div class="user-name">{{ userStore.userInfo?.name || '用户' }}</div>
            <div class="user-phone">{{ userStore.userInfo?.phone || '未绑定手机号' }}</div>
          </div>
        </div>
        <van-icon name="arrow" class="arrow-icon" @click="goToEditProfile" />
      </div>
      
      <div class="order-section">
        <div class="section-header">
          <span class="section-title">我的订单</span>
          <span class="section-more" @click="goToOrders">查看全部 <van-icon name="arrow" /></span>
        </div>
        <van-grid :column-num="5" border class="order-grid">
          <van-grid-item icon="pending-payment" text="待付款" @click="goToOrders('pending_payment')" />
          <van-grid-item icon="todo-list-o" text="待服务" @click="goToOrders('pending_service')" />
          <van-grid-item icon="clock-o" text="服务中" @click="goToOrders('servicing')" />
          <van-grid-item icon="comment-o" text="待评价" @click="goToOrders('pending_review')" />
          <van-grid-item icon="description" text="已完成" @click="goToOrders('completed')" />
        </van-grid>
      </div>
      
      <div class="menu-section">
        <van-cell-group inset class="menu-group">
          <van-cell
            title="我的地址"
            is-link
            icon="location-o"
            @click="goToAddress"
          />
          <van-cell
            v-if="!userStore.isWorker"
            title="成为师傅"
            is-link
            icon="friends-o"
            @click="goToWorkerRegister"
          />
          <van-cell
            v-if="userStore.isWorker"
            title="工人中心"
            is-link
            icon="manager-o"
            @click="goToWorkerDashboard"
          />
          <van-cell
            title="设置"
            is-link
            icon="setting-o"
            @click="goToSettings"
          />
          <van-cell
            title="关于我们"
            is-link
            icon="info-o"
            @click="showToast('关于我们')"
          />
        </van-cell-group>
      </div>
      
      <van-button
        type="danger"
        block
        class="logout-btn"
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const goToEditProfile = () => {
  showToast('编辑资料')
}

const goToOrders = (status = '') => {
  router.push({ path: '/orders', query: { status } })
}

const goToAddress = () => {
  router.push('/address')
}

const goToWorkerRegister = () => {
  router.push('/worker/register')
}

const goToWorkerDashboard = () => {
  router.push('/worker/dashboard')
}

const goToSettings = () => {
  showToast('设置')
}

const handleLogout = () => {
  showDialog({
    title: '提示',
    message: '确定要退出登录吗？',
    showCancelButton: true
  }).then(async () => {
    await userStore.logout()
    showToast('已退出登录')
    router.replace('/login')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40px;
}

.profile-content {
  padding: 12px;
}

.user-card {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details {
  .user-name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  
  .user-phone {
    font-size: 13px;
    opacity: 0.9;
  }
}

.arrow-icon {
  font-size: 20px;
  opacity: 0.8;
}

.order-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.section-more {
  font-size: 13px;
  color: #969799;
  display: flex;
  align-items: center;
  
  .van-icon {
    font-size: 12px;
  }
}

.order-grid {
  border-radius: 8px;
  overflow: hidden;
}

.menu-section {
  margin-bottom: 20px;
}

.menu-group {
  border-radius: 12px;
  overflow: hidden;
}

.logout-btn {
  border-radius: 24px;
  height: 48px;
}
</style>
