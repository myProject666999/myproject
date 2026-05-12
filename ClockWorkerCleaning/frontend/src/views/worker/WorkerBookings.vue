<template>
  <div class="page-container">
    <van-nav-bar title="我的订单" left-arrow @click-left="router.back()" />

    <van-tabs v-model:active="activeTab" sticky background="#fff">
      <van-tab title="待服务" :name="1" />
      <van-tab title="服务中" :name="2" />
      <van-tab title="已完成" :name="3" />
      <van-tab title="已取消" :name="4" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad"
      >
        <div v-for="b in bookings" :key="b.id" class="booking-card" @click="router.push(`/worker/bookings/${b.id}">
          <div class="booking-header">
            <div class="pkg-name">{{ b.package?.name || '保洁服务' }}</div>
            <van-tag :type="getStatusType(b.status)">{{ getStatusText(b.status) }}</van-tag>
          </div>
          <div class="booking-info">
            <div class="info-row">
              <van-icon name="location-o" color="#07c160" />
              <span>{{ b.address }}</span>
            </div>
            <div class="info-row">
              <van-icon name="clock-o" color="#ff976a" />
              <span>{{ b.bookingDate }} {{ b.startTime }}-{{ b.endTime }}</span>
            </div>
            <div class="info-row">
              <van-icon name="user-o" color="#1989fa" />
              <span>{{ b.user?.name || '用户' }}</span>
            </div>
          </div>
          <div class="booking-footer">
            <span class="price">¥{{ b.totalAmount }}</span>
            <div class="actions">
              <van-button
                v-if="b.status === 1"
                size="small"
                type="primary"
                @click.stop="acceptOrder(b)"
              >确认接单</van-button>
              <van-button
                v-if="b.status === 2"
                size="small"
                type="primary"
                @click.stop="startService(b)"
              >开始服务</van-button>
              <van-button
                v-if="b.status === 3"
                size="small"
                type="success"
                @click.stop="completeService(b)"
              >完成服务</van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { bookings as bookingsApi } from '@/api';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();

const activeTab = ref(Number(route.query.status || 1));
const bookings = ref([]);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

const statusMap = {
  1: { text: '待服务', type: 'warning' },
  2: { text: '服务中', type: 'primary' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已取消', type: 'default' },
  5: { text: '待支付', type: 'info' },
};

function getStatusText(s) { return statusMap[s]?.text || '未知'; }
function getStatusType(s) { return statusMap[s]?.type || 'default'; }

async function loadBookings(init = false) {
  if (init) {
    page.value = 1;
    finished.value = false;
    bookings.value = [];
  }

  loading.value = true;
  try {
    const res = await bookingsApi.workerList({
      page: page.value,
      pageSize: 10,
      status: activeTab.value,
    });
    const list = res.data?.list || [];
    bookings.value = init ? list : [...bookings.value, ...list];
    if (list.length < 10) finished.value = true;
    page.value++;
  } catch (e) {
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function onLoad() {
  loadBookings(false);
}

function onRefresh() {
  refreshing.value = true;
  loadBookings(true);
}

async function acceptOrder(b) {
  try {
    await bookingsApi.accept(b.id);
    showToast('接单成功');
    onRefresh();
  } catch (e) {}
}

async function startService(b) {
  try {
    await bookingsApi.start(b.id);
    showToast('服务已开始');
    onRefresh();
  } catch (e) {}
}

async function completeService(b) {
  try {
    await bookingsApi.complete(b.id);
    showToast('服务已完成');
    onRefresh();
  } catch (e) {}
}

watch(activeTab, () => {
  loadBookings(true);
});

onMounted(() => {
  loadBookings(true);
});
</script>

<style scoped>
.booking-card {
  background: #fff;
  margin-bottom: 12px;
  border-radius: 12px;
  padding: 16px;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.pkg-name {
  font-weight: 600;
}

.booking-info {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
}

.info-row:last-child {
  margin-bottom: 0;
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6034;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
