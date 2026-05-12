<template>
  <div class="home-page">
    <div class="home-banner">
      <h2>专业保洁服务</h2>
      <p>让生活更洁净</p>
    </div>

    <div class="quick-entry">
      <div class="entry-item" @click="router.push('/packages')">
        <van-icon name="shop-o" size="32" color="#07c160" />
        <span>保洁套餐</span>
      </div>
      <div class="entry-item" @click="router.push('/workers')">
        <van-icon name="friends-o" size="32" color="#1989fa" />
        <span>选择阿姨</span>
      </div>
      <div class="entry-item" @click="router.push('/bookings')">
        <van-icon name="orders-o" size="32" color="#ff976a" />
        <span>我的预约</span>
      </div>
      <div class="entry-item" @click="router.push('/coupons')">
        <van-icon name="coupon-o" size="32" color="#ee0a24" />
        <span>优惠券</span>
      </div>
    </div>

    <div class="page-container">
      <div class="page-title">热门套餐</div>
      <van-loading v-if="loading" style="text-align: center; padding: 30px" />
      <div v-else class="package-list">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-card"
          @click="goToPackage(pkg.id)"
        >
          <div class="package-info">
            <h3>{{ pkg.name }}</h3>
            <p class="package-desc">{{ pkg.description }}</p>
            <div class="package-price">
              <span class="text-price">¥{{ pkg.pricePerHour }}</span>
              <span class="text-secondary">/小时</span>
              <span class="package-hours text-secondary">起{{ pkg.minHours }}小时</span>
            </div>
          </div>
          <van-button type="primary" size="small">查看</van-button>
        </div>
      </div>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { packages as packagesApi } from '@/api';

const router = useRouter();
const activeTab = ref(0);
const loading = ref(false);
const packages = ref([]);

async function loadPackages() {
  loading.value = true;
  try {
    const res = await packagesApi.list({ pageSize: 20 });
    packages.value = res.data?.list || [];
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

function goToPackage(id) {
  router.push(`/packages/${id}`);
}

onMounted(() => {
  loadPackages();
});
</script>

<style scoped>
.home-banner {
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  padding: 40px 20px;
  color: #fff;
  text-align: center;
}

.home-banner h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.quick-entry {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 20px 0;
  margin-top: -20px;
  margin-left: 12px;
  margin-right: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
}

.package-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.package-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.package-info h3 {
  margin-bottom: 6px;
  font-size: 16px;
}

.package-desc {
  color: #999;
  font-size: 12px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.text-price {
  font-size: 20px;
  color: #ff6034;
  font-weight: bold;
}

.package-hours {
  margin-left: 8px;
}
</style>
