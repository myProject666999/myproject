<template>
  <div class="page-container">
    <van-nav-bar title="阿姨详情" left-arrow @click-left="router.back()" />

    <van-loading v-if="loading" style="text-align: center; padding: 50px" />

    <div v-else-if="worker">
      <div class="card worker-profile">
        <div class="worker-header">
          <div class="worker-avatar">
            <van-icon name="user-o" size="48" />
          </div>
          <div class="worker-info">
            <h2>{{ worker.realName }}</h2>
            <div class="rating-row">
              <van-rate v-model="worker.rating" readonly size="16" color="#ffd21e" />
              <span class="rating">{{ worker.rating }}</span>
            </div>
            <div class="worker-meta text-secondary">
              {{ worker.age }}岁 · 从业{{ worker.experience }}年 · 完成{{ worker.orderCount }}单
            </div>
          </div>
        </div>

        <div class="skill-tags">
          <van-tag v-for="tag in (worker.skillTags?.split(',') || [])" :key="tag" type="primary" round>
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <div class="card" v-if="certificates.length">
        <h3 class="section-title">资质证件</h3>
        <div v-for="cert in certificates" :key="cert.id" class="cert-item">
          <div class="cert-left">
            <van-icon name="description" color="#07c160" size="20" />
            <div>
              <div class="cert-type">{{ cert.certType }}</div>
              <div class="cert-no text-secondary">编号：{{ cert.certNo }}</div>
            </div>
          </div>
          <div class="cert-right">
            <van-tag :type="cert.status === 1 ? 'success' : 'danger'">
              {{ cert.status === 1 ? '有效' : '过期' }}
            </van-tag>
            <div class="cert-date text-secondary">{{ cert.issueDate }} - {{ cert.expireDate }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">选择服务套餐</h3>
        <van-loading v-if="packagesLoading" style="text-align: center; padding: 20px" />
        <div v-else class="package-list">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            class="package-item"
            @click="selectPackage(pkg)"
          >
            <div class="pkg-info">
              <h4>{{ pkg.name }}</h4>
              <div class="pkg-price">
                <span class="price">¥{{ pkg.pricePerHour }}</span>
                <span class="unit">/小时</span>
              </div>
            </div>
            <van-button type="primary" size="small">预约</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { workers as workersApi, packages as packagesApi } from '@/api';

const router = useRouter();
const route = useRoute();

const worker = ref(null);
const certificates = ref([]);
const packages = ref([]);
const loading = ref(false);
const packagesLoading = ref(false);

async function loadWorker() {
  loading.value = true;
  try {
    const res = await workersApi.detail(route.params.id);
    worker.value = res.data;
    certificates.value = res.data?.certificates || [];
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

async function loadPackages() {
  packagesLoading.value = true;
  try {
    const res = await packagesApi.list({ pageSize: 20 });
    packages.value = res.data?.list || [];
  } catch (e) {
  } finally {
    packagesLoading.value = false;
  }
}

function selectPackage(pkg) {
  router.push({
    path: '/bookings/create',
    query: {
      packageId: pkg.id,
      workerId: worker.value.id,
    },
  });
}

onMounted(() => {
  loadWorker();
  loadPackages();
});
</script>

<style scoped>
.worker-profile {
  text-align: center;
}

.worker-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.worker-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.worker-info {
  text-align: left;
  flex: 1;
}

.worker-info h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.rating {
  font-size: 14px;
  color: #ff976a;
  font-weight: bold;
}

.worker-meta {
  font-size: 12px;
}

.skill-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.cert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cert-item:last-child {
  border-bottom: none;
}

.cert-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cert-type {
  font-size: 14px;
  font-weight: 500;
}

.cert-no {
  font-size: 12px;
}

.cert-right {
  text-align: right;
}

.cert-date {
  font-size: 11px;
  margin-top: 4px;
}

.package-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.package-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 10px;
}

.package-item h4 {
  margin: 0 0 4px;
  font-size: 15px;
}

.pkg-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6034;
}

.unit {
  font-size: 12px;
  color: #999;
}
</style>
