<template>
  <div class="page-container">
    <van-nav-bar title="薪资结算" left-arrow @click-left="router.back()" />

    <div class="summary-card">
      <div class="summary-item">
        <div class="summary-value">¥{{ totalEarnings }}</div>
        <div class="summary-label">累计收入</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">¥{{ unpaidAmount }}</div>
        <div class="summary-label">待结算</div>
      </div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
      >
        <div v-for="s in salaries" :key="s.id" class="salary-card">
          <div class="salary-header">
            <div class="salary-period">{{ s.period }}</div>
            <van-tag :type="s.status === 1 ? 'success' : 'warning'">
              {{ s.status === 1 ? '已发放' : '待发放' }}
            </van-tag>
          </div>
          <div class="salary-detail">
            <div class="detail-row">
              <span class="label">正常工时</span>
              <span class="value">{{ s.totalNormalHours }}h</span>
            </div>
            <div class="detail-row">
              <span class="label">加班工时</span>
              <span class="value">{{ s.totalOvertimeHours }}h</span>
            </div>
            <div class="detail-row">
              <span class="label">基础薪资</span>
              <span class="value">¥{{ s.normalAmount }}</span>
            </div>
            <div class="detail-row">
              <span class="label">加班薪资</span>
              <span class="value">¥{{ s.overtimeAmount }}</span>
            </div>
            <div class="detail-row total">
              <span class="label">应发工资</span>
              <span class="value price">¥{{ s.totalAmount }}</span>
            </div>
          </div>
          <div class="salary-footer text-secondary">
            结算时间：{{ s.settledAt || '-' }}
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { salary as salaryApi } from '@/api';

const router = useRouter();

const salaries = ref([]);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

const totalEarnings = computed(() => {
  return salaries.value
    .filter(s => s.status === 1)
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0).toFixed(2);
});

const unpaidAmount = computed(() => {
  return salaries.value
    .filter(s => s.status === 0)
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0).toFixed(2);
});

async function loadSalaries(init = false) {
  if (init) {
    page.value = 1;
    finished.value = false;
    salaries.value = [];
  }

  loading.value = true;
  try {
    const res = await salaryApi.salariesList({
      page: page.value,
      pageSize: 10,
    });
    const list = res.data?.list || [];
    salaries.value = init ? list : [...salaries.value, ...list];
    if (list.length < 10) finished.value = true;
    page.value++;
  } catch (e) {
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function onLoad() {
  loadSalaries(false);
}

function onRefresh() {
  refreshing.value = true;
  loadSalaries(true);
}

onMounted(() => {
  loadSalaries(true);
});
</script>

<style scoped>
.summary-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  padding: 24px;
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
}

.summary-label {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.9;
}

.salary-card {
  background: #fff;
  margin-bottom: 12px;
  border-radius: 12px;
  padding: 16px;
}

.salary-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #eee;
}

.salary-period {
  font-size: 16px;
  font-weight: 600;
}

.salary-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-row .label {
  color: #999;
}

.detail-row.total .value {
  font-weight: bold;
}

.detail-row.total {
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1px solid #f0f0f0;
}

.price {
  color: #ff6034;
  font-size: 16px;
}

.salary-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
}
</style>
