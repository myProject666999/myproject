<template>
  <div class="page-container">
    <van-nav-bar title="预约详情" left-arrow @click-left="router.back()" />

    <van-loading v-if="loading" style="text-align: center; padding: 50px" />

    <div v-else-if="booking">
      <div class="card">
        <div class="booking-status">
          <h2>{{ getStatusLabel(booking.status) }}</h2>
          <p class="text-secondary">{{ booking.bookingNo }}</p>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">服务信息</h3>
        <van-cell-group inset border={false}>
          <van-cell title="服务套餐" :value="booking.package?.name" />
          <van-cell title="服务阿姨" :value="booking.worker?.realName" />
          <van-cell title="服务日期" :value="booking.serviceDate" />
          <van-cell title="服务时间" :value="`${booking.startTime}:00 - ${booking.endTime}:00 (${booking.hours}小时)`" />
          <van-cell title="服务地址" :value="booking.address" />
          <van-cell title="联系人" :value="`${booking.contactName} ${booking.contactPhone}`" />
        </van-cell-group>
      </div>

      <div class="card">
        <h3 class="section-title">费用明细</h3>
        <van-cell-group inset border={false}>
          <van-cell title="套餐费用" :value="`¥${booking.packagePrice}`" />
          <van-cell v-if="booking.discountAmount > 0" title="优惠券优惠" :value="`-¥${booking.discountAmount}`" value-class="text-primary" />
          <van-cell title="实付金额" :value="`¥${booking.totalAmount}`" value-class="text-price" />
        </van-cell-group>
      </div>

      <div v-if="booking.remark" class="card">
        <h3 class="section-title">备注</h3>
        <p class="remark-text">{{ booking.remark }}</p>
      </div>

      <div v-if="booking.rating" class="card">
        <h3 class="section-title">用户评价</h3>
        <van-rate v-model="booking.rating" readonly color="#ffd21e" />
        <p v-if="booking.review" class="remark-text">{{ booking.review }}</p>
      </div>

      <div v-if="booking.cancelReason" class="card">
        <h3 class="section-title">取消原因</h3>
        <p class="remark-text text-danger">{{ booking.cancelReason }}</p>
      </div>

      <div class="fixed-bottom">
        <van-button v-if="booking.status === 0" type="primary" block round @click="pay">立即支付</van-button>
        <van-button v-if="booking.status < 2" plain type="danger" block round @click="cancel">取消预约</van-button>
        <van-button v-if="booking.status === 1" type="primary" block round @click="start">开始服务</van-button>
        <van-button v-if="booking.status === 2" type="primary" block round @click="complete">完成服务</van-button>
        <van-button v-if="booking.status === 3 && !booking.rating" type="primary" block round @click="rate">去评价</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { bookings as bookingsApi } from '@/api';
import { showToast, showConfirmDialog, showDialog } from 'vant';

const router = useRouter();
const route = useRoute();

const booking = ref(null);
const loading = ref(false);

const statusLabels = {
  0: '待支付',
  1: '待服务',
  2: '服务中',
  3: '已完成',
  4: '已取消',
  5: '已退款',
};

function getStatusLabel(status) {
  return statusLabels[status] || '未知';
}

async function loadDetail() {
  loading.value = true;
  try {
    const res = await bookingsApi.detail(route.params.id);
    booking.value = res.data;
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

async function pay() {
  try {
    await showConfirmDialog({ title: '确认支付', message: `确认支付 ¥${booking.value.totalAmount} 吗？` });
    await bookingsApi.updateStatus(booking.value.id, { status: 1 });
    showToast('支付成功');
    loadDetail();
  } catch (e) {}
}

async function cancel() {
  try {
    await showConfirmDialog({ title: '确认取消', message: '确定要取消该预约吗？' });
    await bookingsApi.updateStatus(booking.value.id, { status: 4, cancelReason: '用户取消' });
    showToast('取消成功');
    loadDetail();
  } catch (e) {}
}

async function start() {
  await bookingsApi.updateStatus(booking.value.id, { status: 2 });
  showToast('服务已开始');
  loadDetail();
}

async function complete() {
  try {
    await showConfirmDialog({ title: '确认完成', message: '确认服务已完成？' });
    await bookingsApi.updateStatus(booking.value.id, { status: 3 });
    showToast('服务已完成');
    loadDetail();
  } catch (e) {}
}

async function rate() {
  try {
    await showDialog({ title: '简单评价', message: '点击确认给5星好评！', showCancelButton: true });
    await bookingsApi.updateStatus(booking.value.id, { status: 3, rating: 5, review: '服务非常满意！' });
    showToast('评价成功');
    loadDetail();
  } catch (e) {}
}

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.booking-status {
  text-align: center;
}

.booking-status h2 {
  margin: 0;
  color: #07c160;
  font-size: 24px;
  margin-bottom: 6px;
}

.remark-text {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px 20px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 12px;
}

.fixed-bottom .van-button {
  flex: 1;
}
</style>
