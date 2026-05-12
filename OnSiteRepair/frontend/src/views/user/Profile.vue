<template>
  <div class="page-container">
    <van-nav-bar title="个人中心" />
    
    <div class="profile-header">
      <van-image
        round
        :src="userStore.userInfo?.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'"
        :size="80"
      />
      <div class="user-info">
        <div class="nickname">{{ userStore.userInfo?.nickname || '未设置昵称' }}</div>
        <div class="phone">{{ userStore.userInfo?.phone }}</div>
        <div class="type">{{ userStore.userType === 1 ? '普通用户' : '维修师傅' }}</div>
      </div>
    </div>

    <van-cell-group inset>
      <van-cell title="我的订单" icon="orders-o" is-link @click="goOrders" />
      <van-cell title="通知中心" icon="bell-o" is-link @click="goNotifications" />
      <van-cell title="设置" icon="setting-o" is-link @click="showToast('功能开发中')" />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell title="关于我们" icon="info-o" is-link @click="showToast('功能开发中')" />
      <van-cell title="帮助中心" icon="question-o" is-link @click="showToast('功能开发中')" />
    </van-cell-group>

    <div style="margin: 16px;">
      <van-button round block type="danger" @click="logout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const goOrders = () => {
  router.push('/orders')
}

const goNotifications = () => {
  router.push('/notifications')
}

const logout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？'
    })
    userStore.logout()
    router.replace('/login')
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}
</script>

<style scoped>
.profile-header {
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  color: white;
}

.nickname {
  font-size: 18px;
  font-weight: bold;
}

.phone {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
}

.type {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 5px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}
</style>
