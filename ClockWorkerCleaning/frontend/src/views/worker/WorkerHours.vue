<template>
  <div class="page-container">
    <van-nav-bar title="工时统计" left-arrow @click-left="router.back()" />

    <div class="summary-card">
      <div class="summary-item">
        <div class="summary-value">{{ totalHours }}</div>
        <div class="summary-label">总工时</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">{{ normalHours }}</div>
        <div class="summary-label">正常工时</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">{{ overtimeHours }}</div>
        <div class="summary-label">加班工时</div>
      </div>
    </div>

    <van-tabs v-model:active="activeTab" sticky background="#fff">
      <van-tab title="待结算" :name="0" />
      <van-tab title="已结算" :name="1" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
      >
        <div v-for="h in hours" :key="h.id" class="hour-card">
          <div class="hour-header">
            <div class="hour-date">{{ h.workDate }}</div>
            <van-tag :type="h.status === 0 ? 'warning' : 'success'">
              {{ h.status === 0 ? '待结算' : '已结算' }}
            </van-tag>
          </div>
          <div class="hour-info">
            <div class="info-item">
              <span class="label">开始时间</span>
              <span class="value">{{ h.startTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">结束时间</span>
              <span class="value">{{ h.endTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">正常工时</span>
              <span class="value">{{ h.normalHours }}h</span>
            </div>
            <div class="info-item">
              <span class="label">加班工时</span>
              <span class="value">{{ h.overtimeHours }}h</span>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { salary as salaryApi } from '@/api';

const router = useRouter();

const activeTab = ref(0);
const hours = ref([]);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

const totalHours = computed(() => hours.value.reduce((s, h) => s + (h.normalHours || 0) + (h.overtimeHours || 0), 0).toFixed(1));
const normalHours = computed(() => hours.value.reduce((s, h) => s + (h.normalHours || 0), 0).toFixed(1));
const overtimeHours = computed(() => hours.value.reduce((s, h) => s + (h.overtimeHours || 0), 0).toFixed(1));

async function loadHours(init = false) {
  if (init) {
    page.value = 1;
    finished.value = false;
    hours.value = [];
  }

  loading.value = true;
  try {
    const res = await salaryApi.workHoursList({
      page: page.value,
      pageSize: 10,
      status: activeTab.value,
    });
    const list = res.data?.list || [];
    hours.value = init ? list : [...hours.value, ...list];
    if (list.length < 10) finished.value = true;
    page.value++;
  } catch (e) {
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function onLoad() {
  loadHours(false);
}

function onRefresh() {
  refreshing.value = true;
  loadHours(true);
}

watch(activeTab, () => {
  loadHours(true);
});

onMounted(() => {
  loadHours(true);
});
</script>

<style scoped>
.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
}

.summary-label {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.85;
}

.hour-card {
  background: #fff;
  margin-bottom: 12px;
  border-radius: 12px;
  padding: 16px;
}

.hour-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.hour-date {
  font-size: 16px;
  font-weight: 600;
}

.hour-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-item .label {
  color: #999;
  font-size: 13px;
}

.info-item .value {
  font-weight: 500;
  font-size: 13px;
}
</style>
