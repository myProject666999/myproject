<template>
  <div class="page-container">
    <van-nav-bar title="我的预约" left-arrow @click-left="router.back()" />

    <van-tabs v-model:active="activeStatus" sticky background="#fff">
      <van-tab title="全部" name="" />
      <van-tab title="待支付" name="0" />
      <van-tab title="待服务" name="1" />
      <van-tab title="服务中" name="2" />
      <van-tab title="已完成" name="3" />
      <van-tab title="已取消" name="4" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadBookings"
      >
        <div v-for="b in bookings" :key="b.id" class="booking-card" @click="goDetail(b.id)">
          <div class="booking-header">
            <span class="booking-no">{{ b.bookingNo }}</span>
            <van-tag :type="getStatusTagType(b.status)">
              {{ getStatusLabel(b.status) }}
            </van-tag>
          </div>

          <div class="booking-body">
            <div class="booking-info-row">
              <van-icon name="shop-o" color="#07c160" />
              <span>{{ b.package?.name }}</span>
              <span class="text-price">¥{{ b.totalAmount }}</span>
            </div>
            <div class="booking-info-row">
              <van-icon name="friends-o" color="#1989fa" />
              <span>{{ b.worker?.realName }}</span>
            </div>
            <div class="booking-info-row">
              <van-icon name="calendar-o" color="#ff976a" />
              <span>{{ b.serviceDate }} {{ b.startTime }}:00 - {{ b.endTime }}:00 ({{ b.hours }}小时)</span>
            </div>
            <div class="booking-info-row">
              <van-icon name="location-o" color="#ee0a24" />
              <span>{{ b.address }}</span>
            </div>
          </div>

          <div class="booking-actions">
            <van-button v-if="b.status === 0" type="primary" size="small" @click.stop="payBooking(b)">
              立即支付
            </van-button>
            <van-button v-if="b.status < 2" plain type="danger" size="small" @click.stop="cancelBooking(b)">
              取消预约
            </van-button>
            <van-button v-if="b.status === 1" type="primary" size="small" @click.stop="startService(b)">
              开始服务
            </van-button>
            <van-button v-if="b.status === 3 && !b.rating" type="primary" size="small" @click.stop="rateBooking(b)">
              去评价
            </van-button>
            <van-button v-if="b.status === 3" plain type="primary" size="small" @click.stop="goPhotos(b.id)">
              查看照片
            </van-button>
          </div>
        </div>

        <van-empty v-if="bookings.length === 0 && !loading" description="暂无预约" />
      </van-list>
    </van-pull-refresh>

    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/packages" icon="shop-o">套餐</van-tabbar-item>
      <van-tabbar-item to="/bookings" icon="orders-o">预约</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { bookings as bookingsApi } from '@/api';
import { showToast, showConfirmDialog, showDialog } from 'vant';

const router = useRouter();

const activeTab = ref(2);
const activeStatus = ref('');
const bookings = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
let page = 1;

const statusLabels = {
  0: '待支付',
  1: '待服务',
  2: '服务中',
  3: '已完成',
  4: '已取消',
  5: '已退款',
};

const statusTagTypes = {
  0: 'warning',
  1: 'primary',
  2: 'success',
  3: 'default',
  4: 'danger',
  5: 'default',
};

function getStatusLabel(status) {
  return statusLabels[status] || '未知';
}

function getStatusTagType(status) {
  return statusTagTypes[status] || 'default';
}

async function loadBookings() {
  try {
    const res = await bookingsApi.list({ page, pageSize: 10, status: activeStatus.value });
    const list = res.data?.list || [];
    if (page === 1) {
      bookings.value = list;
    } else {
      bookings.value = [...bookings.value, ...list];
    }
    if (list.length < 10) {
      finished.value = true;
    } else {
      page++;
    }
  } catch (e) {
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function onRefresh() {
  page = 1;
  finished.value = false;
  bookings.value = [];
  await loadBookings();
}

function goDetail(id) {
  router.push(`/bookings/${id}`);
}

function goPhotos(id) {
  router.push(`/bookings/${id}/photos`);
}

async function payBooking(b) {
  try {
    await showConfirmDialog({ title: '确认支付', message: `确认支付 ¥${b.totalAmount} 吗？` });
    await bookingsApi.updateStatus(b.id, { status: 1 });
    showToast('支付成功');
    onRefresh();
  } catch (e) {}
}

async function cancelBooking(b) {
  try {
    await showConfirmDialog({ title: '确认取消', message: '确定要取消该预约吗？' });
    await bookingsApi.updateStatus(b.id, { status: 4, cancelReason: '用户取消' });
    showToast('取消成功');
    onRefresh();
  } catch (e) {}
}

async function startService(b) {
  try {
    await bookingsApi.updateStatus(b.id, { status: 2 });
    showToast('服务已开始');
    onRefresh();
  } catch (e) {}
}

async function rateBooking(b) {
  try {
    const result = await showDialog({
      title: '简单评价',
      message: '点击确认给5星好评，感谢您的使用！',
      showCancelButton: true,
    });
    await bookingsApi.updateStatus(b.id, { status: 3, rating: 5, review: '服务非常满意！' });
    showToast('评价成功');
    onRefresh();
  } catch (e) {}
}

watch(activeStatus, () => {
  onRefresh();
});

loadBookings();
</script>

<style scoped>
.booking-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.booking-no {
  font-size: 12px;
  color: #999;
}

.booking-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booking-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.text-price {
  margin-left: auto;
  font-weight: bold;
  color: #ff6034;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
