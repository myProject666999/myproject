<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="avatar">
        <van-icon name="user-o" size="48" />
      </div>
      <div class="info">
        <h2>{{ userStore.userInfo?.nickName || '用户' }}</h2>
        <p class="phone">{{ userStore.userInfo?.phone }}</p>
      </div>
    </div>

    <div class="menu-section">
      <van-cell-group inset>
        <van-cell title="我的预约" icon="orders-o" is-link @click="router.push('/bookings')" />
        <van-cell title="优惠券" icon="coupon-o" is-link @click="router.push('/coupons')" />
        <van-cell title="联系客服" icon="service-o" is-link @click="showToast('客服电话：400-123-4567')" />
        <van-cell title="关于我们" icon="info-o" is-link @click="showToast('钟点工保洁预约 v1.0')" />
      </van-cell-group>
    </div>

    <div class="logout-section">
      <van-button plain type="danger" block @click="logout">退出登录</van-button>
    </div>

    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/packages" icon="shop-o">套餐</van-tabbar-item>
      <van-tabbar-item to="/bookings" icon="orders-o">预约</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showToast, showConfirmDialog } from 'vant';

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref(3);

async function logout() {
  try {
    await showConfirmDialog({ title: '确认退出', message: '确定要退出登录吗？' });
    userStore.logout();
    router.replace('/login');
  } catch (e) {}
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}

.profile-header {
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.info h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.info .phone {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.menu-section {
  margin-top: 12px;
}

.logout-section {
  padding: 20px;
}
</style>
