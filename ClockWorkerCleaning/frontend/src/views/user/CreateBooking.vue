<template>
  <div class="page-container">
    <van-nav-bar title="预约保洁" left-arrow @click-left="router.back()" />

    <div class="card">
      <h3 class="section-title">服务信息</h3>
      <van-cell-group inset border={false}>
        <van-cell title="套餐" :value="pkg?.name || '请选择套餐'" is-link @click="showPackagePicker = true" />
        <van-cell title="服务阿姨" :value="worker?.realName || '请选择阿姨'" is-link @click="showWorkerPicker = true" />
      </van-cell-group>
    </div>

    <div class="card">
      <h3 class="section-title">服务时间</h3>

      <van-calendar v-model:show="showCalendar" @confirm="onDateSelect" color="#07c160" :min-date="minDate" />

      <van-cell title="服务日期" :value="form.serviceDate || '请选择'" is-link @click="showCalendar = true" />

      <div v-if="form.serviceDate && worker" class="time-slots">
        <div class="slot-header">
          <span>选择时间段</span>
          <van-loading v-if="slotsLoading" size="16" />
        </div>
        <div class="slot-grid">
          <div
            v-for="slot in timeSlots"
            :key="slot.hour"
            :class="['slot-item', getSlotClass(slot)]"
            @click="toggleSlot(slot)"
          >
            {{ slot.label }}
          </div>
        </div>
        <div class="slot-tip text-secondary" v-if="selectedHours.length">
          已选 {{ selectedHours.length }} 小时：{{ form.startTime }}:00 - {{ form.endTime }}:00
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">服务地址</h3>
      <van-field v-model="form.address" label="服务地址" placeholder="请输入详细地址" />
      <van-field v-model="form.contactName" label="联系人" placeholder="请输入联系人姓名" />
      <van-field v-model="form.contactPhone" type="tel" label="联系电话" placeholder="请输入联系电话" />
      <van-field v-model="form.remark" label="备注" type="textarea" placeholder="特殊需求说明（选填）" rows="2" />
    </div>

    <div class="card" v-if="usableCoupons.length">
      <h3 class="section-title">优惠券</h3>
      <van-radio-group v-model="selectedCouponId">
        <div
          v-for="uc in usableCoupons"
          :key="uc.id"
          class="coupon-item"
          @click="selectedCouponId = uc.id"
        >
          <van-radio :name="uc.id" />
          <div class="coupon-info">
            <span class="coupon-name">{{ uc.coupon.name }}</span>
            <span class="coupon-discount text-price">
              {{ uc.coupon.type === 'fixed' ? '减¥' + uc.coupon.discountValue : uc.coupon.discountValue + '折' }}
            </span>
          </div>
        </div>
      </van-radio-group>
    </div>

    <div class="fixed-bottom">
      <div class="price-summary">
        <span class="label">合计：</span>
        <span class="total text-price">¥{{ totalPrice }}</span>
        <span v-if="discount > 0" class="discount text-secondary">已优惠 ¥{{ discount }}</span>
      </div>
      <van-button type="primary" round :loading="submitting" @click="submitBooking">
        提交预约
      </van-button>
    </div>

    <van-popup v-model:show="showPackagePicker" position="bottom" round>
      <div class="picker-header">选择套餐</div>
      <van-picker
        :columns="packageOptions"
        @confirm="onPackageConfirm"
        @cancel="showPackagePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showWorkerPicker" position="bottom" round>
      <div class="picker-header">选择阿姨</div>
      <van-picker
        :columns="workerOptions"
        @confirm="onWorkerConfirm"
        @cancel="showWorkerPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { packages as packagesApi, workers as workersApi, coupons as couponsApi, bookings as bookingsApi } from '@/api';
import { showToast, showDialog } from 'vant';

const router = useRouter();
const route = useRoute();

const form = reactive({
  packageId: null,
  workerId: null,
  serviceDate: '',
  startTime: null,
  endTime: null,
  address: '',
  contactName: '',
  contactPhone: '',
  remark: '',
  userCouponId: null,
});

const pkg = ref(null);
const worker = ref(null);
const packages = ref([]);
const workers = ref([]);
const timeSlots = ref([]);
const selectedHours = ref([]);
const slotsLoading = ref(false);
const showCalendar = ref(false);
const showPackagePicker = ref(false);
const showWorkerPicker = ref(false);
const usableCoupons = ref([]);
const selectedCouponId = ref(null);
const submitting = ref(false);

const minDate = new Date();

const packageOptions = computed(() => packages.value.map((p) => ({ text: `${p.name} ¥${p.pricePerHour}/小时`, value: p.id })));
const workerOptions = computed(() => workers.value.map((w) => ({ text: `${w.realName} (评分${w.rating})`, value: w.id })));

const totalHours = computed(() => {
  if (form.startTime === null || form.endTime === null) return 0;
  return form.endTime - form.startTime;
});

const packagePrice = computed(() => {
  if (!pkg.value || !totalHours.value) return 0;
  return Number((pkg.value.pricePerHour * totalHours.value).toFixed(2));
});

const discount = computed(() => {
  if (!selectedCouponId.value) return 0;
  const uc = usableCoupons.value.find((c) => c.id === selectedCouponId.value);
  if (!uc) return 0;
  const c = uc.coupon;
  if (c.type === 'fixed') {
    return Number(c.discountValue);
  }
  return Number((packagePrice.value * (1 - c.discountValue / 100)).toFixed(2));
});

const totalPrice = computed(() => {
  return Math.max(0, Number((packagePrice.value - discount.value).toFixed(2)));
});

function getSlotClass(slot) {
  if (!slot.available) return 'disabled';
  if (selectedHours.value.includes(slot.hour)) return 'selected';
  return '';
}

function toggleSlot(slot) {
  if (!slot.available) return;
  const idx = selectedHours.value.indexOf(slot.hour);
  if (idx > -1) {
    selectedHours.value.splice(idx, 1);
  } else {
    selectedHours.value.push(slot.hour);
  }
  selectedHours.value.sort((a, b) => a - b);
  updateTimeRange();
}

function updateTimeRange() {
  if (selectedHours.value.length === 0) {
    form.startTime = null;
    form.endTime = null;
    return;
  }

  const sorted = [...selectedHours.value].sort((a, b) => a - b);
  let valid = true;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] !== 1) {
      valid = false;
      break;
    }
  }

  if (!valid) {
    showToast('请选择连续的时间段');
    selectedHours.value = [sorted[0]];
  }

  form.startTime = selectedHours.value[0];
  form.endTime = selectedHours.value[selectedHours.value.length - 1] + 1;
}

async function loadPackages() {
  try {
    const res = await packagesApi.list({ pageSize: 50 });
    packages.value = res.data?.list || [];
    if (route.query.packageId && packages.value.length) {
      const found = packages.value.find((p) => p.id == route.query.packageId);
      if (found) {
        pkg.value = found;
        form.packageId = found.id;
      }
    }
  } catch (e) {}
}

async function loadWorkers() {
  try {
    const res = await workersApi.list({ pageSize: 50 });
    workers.value = res.data?.list || [];
    if (route.query.workerId && workers.value.length) {
      const found = workers.value.find((w) => w.id == route.query.workerId);
      if (found) {
        worker.value = found;
        form.workerId = found.id;
        if (form.serviceDate) {
          loadSlots();
        }
      }
    }
  } catch (e) {}
}

async function loadSlots() {
  if (!worker.value || !form.serviceDate) return;
  slotsLoading.value = true;
  selectedHours.value = [];
  form.startTime = null;
  form.endTime = null;
  try {
    const res = await workersApi.getSlots(worker.value.id, form.serviceDate);
    timeSlots.value = res.data?.slots || [];
  } catch (e) {
  } finally {
    slotsLoading.value = false;
  }
}

async function loadCoupons() {
  if (!pkg.value) return;
  try {
    const res = await couponsApi.usable({ amount: pkg.value.pricePerHour * 2 });
    usableCoupons.value = res.data || [];
  } catch (e) {}
}

function onDateSelect({ selectedDates }) {
  if (selectedDates && selectedDates.length) {
    const d = selectedDates[0];
    form.serviceDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    showCalendar.value = false;
    if (worker.value) {
      loadSlots();
    }
  }
}

function onPackageConfirm({ selectedOptions }) {
  const option = selectedOptions[0];
  const found = packages.value.find((p) => p.id === option.value);
  if (found) {
    pkg.value = found;
    form.packageId = found.id;
    loadCoupons();
  }
  showPackagePicker.value = false;
}

function onWorkerConfirm({ selectedOptions }) {
  const option = selectedOptions[0];
  const found = workers.value.find((w) => w.id === option.value);
  if (found) {
    worker.value = found;
    form.workerId = found.id;
    if (form.serviceDate) {
      loadSlots();
    }
  }
  showWorkerPicker.value = false;
}

async function submitBooking() {
  if (!form.packageId) return showToast('请选择套餐');
  if (!form.workerId) return showToast('请选择阿姨');
  if (!form.serviceDate) return showToast('请选择服务日期');
  if (totalHours.value < 1) return showToast('请选择服务时间段');
  if (pkg.value && totalHours.value < pkg.value.minHours) {
    return showToast(`该套餐最少服务${pkg.value.minHours}小时`);
  }
  if (!form.address) return showToast('请输入服务地址');
  if (!form.contactName) return showToast('请输入联系人');
  if (!form.contactPhone) return showToast('请输入联系电话');

  submitting.value = true;
  try {
    const data = { ...form };
    if (selectedCouponId.value) {
      data.userCouponId = selectedCouponId.value;
    }
    const res = await bookingsApi.create(data);
    showToast('预约成功');
    router.replace(`/bookings/${res.data.id}`);
  } catch (e) {
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadPackages();
  loadWorkers();
});

watch([() => form.packageId, () => pkg.value], () => {
  if (pkg.value) {
    loadCoupons();
  }
});
</script>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.time-slots {
  padding: 12px;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.slot-item {
  padding: 10px 6px;
  text-align: center;
  background: #f7f8fa;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid transparent;
}

.slot-item.selected {
  background: #e8f5e9;
  border-color: #07c160;
  color: #07c160;
}

.slot-item.disabled {
  background: #f0f0f0;
  color: #bbb;
  text-decoration: line-through;
}

.slot-tip {
  margin-top: 10px;
  font-size: 12px;
}

.coupon-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.coupon-item:last-child {
  border-bottom: none;
}

.coupon-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-name {
  font-size: 14px;
}

.picker-header {
  padding: 14px 16px;
  text-align: center;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
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
  align-items: center;
  gap: 12px;
}

.price-summary {
  flex: 1;
}

.price-summary .label {
  font-size: 14px;
}

.price-summary .total {
  font-size: 22px;
  font-weight: bold;
}

.price-summary .discount {
  font-size: 12px;
  margin-left: 6px;
}
</style>
