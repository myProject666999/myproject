<template>
  <div class="page-container">
    <van-nav-bar title="保洁套餐" left-arrow @click-left="router.back()" />

    <div class="package-tabs">
      <div
        v-for="t in packageTypes"
        :key="t.value"
        :class="['tab-item', { active: activeType === t.value }]"
        @click="switchType(t.value)"
      >
        {{ t.label }}
      </div>
    </div>

    <van-loading v-if="loading" style="text-align: center; padding: 30px" />

    <div v-else class="package-list">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="package-card"
        @click="router.push(`/packages/${pkg.id}`)"
      >
        <div class="package-header">
          <h3>{{ pkg.name }}</h3>
          <van-tag :type="getTagType(pkg.type)" size="mini">
            {{ getTypeLabel(pkg.type) }}
          </van-tag>
        </div>
        <p class="package-desc">{{ pkg.description }}</p>
        <div class="package-footer">
          <div class="package-price">
            <span class="price">¥{{ pkg.pricePerHour }}</span>
            <span class="unit">/小时</span>
            <span class="hours text-secondary">{{ pkg.minHours }}-{{ pkg.maxHours }}小时</span>
          </div>
          <van-button type="primary" size="small">立即预约</van-button>
        </div>
      </div>

      <van-empty v-if="packages.length === 0" description="暂无套餐" />
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { packages as packagesApi } from '@/api';

const router = useRouter();
const activeTab = ref(1);
const activeType = ref('');
const loading = ref(false);
const packages = ref([]);

const packageTypes = [
  { label: '全部', value: '' },
  { label: '日常保洁', value: 'daily' },
  { label: '深度保洁', value: 'deep' },
  { label: '开荒保洁', value: '开荒' },
];

function getTagType(type) {
  const map = { daily: 'success', deep: 'warning', '开荒': 'danger' };
  return map[type] || 'default';
}

function getTypeLabel(type) {
  const map = { daily: '日常', deep: '深度', '开荒': '开荒' };
  return map[type] || '';
}

async function loadPackages() {
  loading.value = true;
  try {
    const params = { pageSize: 20 };
    if (activeType.value) {
      params.type = activeType.value;
    }
    const res = await packagesApi.list(params);
    packages.value = res.data?.list || [];
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

function switchType(type) {
  activeType.value = type;
}

watch(activeType, () => {
  loadPackages();
});

onMounted(() => {
  loadPackages();
});
</script>

<style scoped>
.package-tabs {
  display: flex;
  background: #fff;
  margin-bottom: 12px;
  border-radius: 8px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
  border-radius: 6px;
  transition: all 0.2s;
}

.tab-item.active {
  background: #07c160;
  color: #fff;
}

.package-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.package-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.package-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.package-header h3 {
  font-size: 17px;
  margin: 0;
}

.package-desc {
  color: #999;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.package-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price {
  font-size: 22px;
  font-weight: bold;
  color: #ff6034;
}

.unit {
  font-size: 13px;
  color: #666;
}

.hours {
  font-size: 12px;
  margin-left: 8px;
}
</style>
