<template>
  <div class="page-container">
    <van-nav-bar title="优惠券" left-arrow @click-left="router.back()" />

    <van-tabs v-model:active="activeTab" sticky background="#fff">
      <van-tab title="可领取" name="available" />
      <van-tab title="我的优惠券" name="my" />
    </van-tabs>

    <div v-if="activeTab === 'available'">
      <van-loading v-if="loading" style="text-align: center; padding: 30px" />
      <div v-else class="coupon-list">
        <div v-for="c in availableCoupons" :key="c.id" class="coupon-card">
          <div class="coupon-left">
            <div class="coupon-price">
              <span v-if="c.type === 'fixed'">¥{{ c.discountValue }}</span>
              <span v-else>{{ c.discountValue }}折</span>
            </div>
            <div class="coupon-condition" v-if="c.minAmount > 0">满{{ c.minAmount }}元可用</div>
          </div>
          <div class="coupon-right">
            <h3>{{ c.name }}</h3>
            <p class="text-secondary">{{ c.validStart }} 至 {{ c.validEnd }}</p>
            <van-button type="primary" size="small" @click="claimCoupon(c)">领取</van-button>
          </div>
        </div>
        <van-empty v-if="availableCoupons.length === 0" description="暂无可领取优惠券" />
      </div>
    </div>

    <div v-else>
      <van-tabs v-model:active="myStatus" background="#fff">
        <van-tab title="未使用" :name="0" />
        <van-tab title="已使用" :name="1" />
        <van-tab title="已过期" :name="2" />
      </van-tabs>

      <van-loading v-if="myLoading" style="text-align: center; padding: 30px" />
      <div v-else class="coupon-list">
        <div v-for="uc in myCoupons" :key="uc.id" class="coupon-card">
          <div class="coupon-left">
            <div class="coupon-price">
              <span v-if="uc.coupon.type === 'fixed'">¥{{ uc.coupon.discountValue }}</span>
              <span v-else>{{ uc.coupon.discountValue }}折</span>
            </div>
            <div class="coupon-condition" v-if="uc.coupon.minAmount > 0">满{{ uc.coupon.minAmount }}元可用</div>
          </div>
          <div class="coupon-right">
            <h3>{{ uc.coupon.name }}</h3>
            <p class="text-secondary">{{ uc.validStart }} 至 {{ uc.validEnd }}</p>
            <van-tag v-if="uc.status === 0" type="primary">未使用</van-tag>
            <van-tag v-else-if="uc.status === 1" type="success">已使用</van-tag>
            <van-tag v-else type="default">已过期</van-tag>
          </div>
        </div>
        <van-empty v-if="myCoupons.length === 0" description="暂无优惠券" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { coupons as couponsApi } from '@/api';
import { showToast } from 'vant';

const router = useRouter();

const activeTab = ref('available');
const myStatus = ref(0);
const loading = ref(false);
const myLoading = ref(false);
const availableCoupons = ref([]);
const myCoupons = ref([]);

async function loadAvailable() {
  loading.value = true;
  try {
    const res = await couponsApi.available({ pageSize: 50 });
    availableCoupons.value = res.data?.list || [];
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

async function loadMy() {
  myLoading.value = true;
  try {
    const res = await couponsApi.myList({ pageSize: 50, status: myStatus.value });
    myCoupons.value = res.data?.list || [];
  } catch (e) {
  } finally {
    myLoading.value = false;
  }
}

async function claimCoupon(c) {
  try {
    await couponsApi.claim({ couponId: c.id });
    showToast('领取成功');
    loadAvailable();
  } catch (e) {}
}

watch(myStatus, () => {
  loadMy();
});

watch(activeTab, (val) => {
  if (val === 'available') {
    loadAvailable();
  } else {
    loadMy();
  }
});

onMounted(() => {
  loadAvailable();
});
</script>

<style scoped>
.coupon-list {
  padding: 12px;
}

.coupon-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.coupon-left {
  background: linear-gradient(135deg, #ff6034 0%, #ee0a24 100%);
  color: #fff;
  padding: 16px;
  min-width: 100px;
  text-align: center;
}

.coupon-price {
  font-size: 28px;
  font-weight: bold;
}

.coupon-condition {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.9;
}

.coupon-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-right h3 {
  margin: 0 0 4px;
  font-size: 15px;
}

.coupon-right p {
  margin: 0 0 8px;
  font-size: 12px;
}
</style>
