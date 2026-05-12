<template>
  <div class="page-container">
    <van-nav-bar title="套餐详情" left-arrow @click-left="router.back()" />

    <van-loading v-if="loading" style="text-align: center; padding: 50px" />

    <div v-else>
      <div class="card">
        <div class="pkg-header">
          <h2>{{ pkg.name }}</h2>
          <van-tag :type="getTagType(pkg.type)" size="small">
            {{ getTypeLabel(pkg.type) }}
          </van-tag>
        </div>

        <div class="price-section">
          <span class="price">¥{{ pkg.pricePerHour }}</span>
          <span class="unit">/小时</span>
          <span class="min-hours">最低{{ pkg.minHours }}小时</span>
        </div>

        <p class="desc">{{ pkg.description }}</p>
      </div>

      <div v-if="includes.length" class="card">
        <h3 class="section-title">服务内容</h3>
        <ul class="includes-list">
          <li v-for="(item, i) in includes" :key="i">
            <van-icon name="passed" color="#07c160" size="14" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <div class="card">
        <h3 class="section-title">选择服务阿姨</h3>
        <van-loading v-if="workersLoading" style="text-align: center; padding: 20px" />
        <div v-else class="worker-list">
          <div
            v-for="w in workers"
            :key="w.id"
            :class="['worker-item', { selected: selectedWorker?.id === w.id }]"
            @click="selectWorker(w)"
          >
            <div class="worker-avatar">
              <van-icon name="user-o" size="36" />
            </div>
            <div class="worker-info">
              <div class="worker-name">
                {{ w.realName }}
                <van-rate v-model="w.rating" readonly size="14" color="#ffd21e" />
                <span class="rating-text">{{ w.rating }}</span>
              </div>
              <div class="worker-tags">
                <van-tag v-for="tag in w.skillTags?.split(',')" :key="tag" size="mini" type="primary">
                  {{ tag }}
                </van-tag>
              </div>
              <div class="worker-meta text-secondary">
                从业{{ w.experience }}年 · 完成{{ w.orderCount }}单
              </div>
            </div>
            <van-icon v-if="selectedWorker?.id === w.id" name="checked" color="#07c160" size="20" />
          </div>
        </div>
      </div>
    </div>

    <div class="fixed-bottom">
      <van-button type="primary" round block :disabled="!selectedWorker" @click="goBook">
        {{ selectedWorker ? '立即预约' : '请先选择阿姨' }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { packages as packagesApi, workers as workersApi } from '@/api';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();

const pkg = ref(null);
const loading = ref(false);
const workers = ref([]);
const workersLoading = ref(false);
const selectedWorker = ref(null);

const includes = computed(() => {
  if (!pkg.value?.includes) return [];
  try {
    return JSON.parse(pkg.value.includes);
  } catch {
    return [];
  }
});

function getTagType(type) {
  const map = { daily: 'success', deep: 'warning', '开荒': 'danger' };
  return map[type] || 'default';
}

function getTypeLabel(type) {
  const map = { daily: '日常保洁', deep: '深度保洁', '开荒': '开荒保洁' };
  return map[type] || '';
}

function selectWorker(w) {
  selectedWorker.value = w;
}

function goBook() {
  if (!selectedWorker.value) {
    showToast('请选择阿姨');
    return;
  }
  router.push({
    path: '/bookings/create',
    query: {
      packageId: pkg.value.id,
      workerId: selectedWorker.value.id,
    },
  });
}

async function loadPackage() {
  loading.value = true;
  try {
    const res = await packagesApi.detail(route.params.id);
    pkg.value = res.data;
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

async function loadWorkers() {
  workersLoading.value = true;
  try {
    const res = await workersApi.list({ pageSize: 10 });
    workers.value = res.data?.list || [];
  } catch (e) {
  } finally {
    workersLoading.value = false;
  }
}

onMounted(() => {
  loadPackage();
  loadWorkers();
});
</script>

<style scoped>
.pkg-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.pkg-header h2 {
  margin: 0;
  font-size: 20px;
}

.price-section {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
}

.price {
  font-size: 32px;
  font-weight: bold;
  color: #ff6034;
}

.unit {
  font-size: 14px;
  color: #666;
  margin-left: 4px;
}

.min-hours {
  font-size: 12px;
  color: #999;
  margin-left: 12px;
}

.desc {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.section-title {
  font-size: 15px;
  margin-bottom: 12px;
}

.includes-list {
  list-style: none;
}

.includes-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
}

.worker-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.worker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f7f8fa;
  border: 2px solid transparent;
}

.worker-item.selected {
  border-color: #07c160;
  background: #f0fff4;
}

.worker-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.worker-info {
  flex: 1;
}

.worker-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-weight: 600;
}

.rating-text {
  font-size: 12px;
  color: #ff976a;
}

.worker-tags {
  margin-bottom: 4px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.worker-meta {
  font-size: 12px;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 20px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
