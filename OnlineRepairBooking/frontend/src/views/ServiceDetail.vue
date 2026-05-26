<template>
  <div class="service-detail page-container">
    <van-nav-bar
      title="服务详情"
      left-arrow
      @click-left="onBack"
    />

    <div v-if="service" class="page-content">
      <div class="service-card card">
        <van-image
          :src="service.image || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          width="100%"
          height="200"
          fit="cover"
          radius="8"
        />
        <div class="service-info">
          <h2 class="service-name">{{ service.name }}</h2>
          <div class="service-meta flex-between mt-8">
            <span class="price">¥{{ service.price }}/{{ service.unit || '次' }}</span>
            <van-tag v-if="service.category" type="primary">{{ service.category }}</van-tag>
          </div>
          <p class="service-desc mt-12">{{ service.description }}</p>
        </div>
      </div>

      <van-cell-group inset class="mt-12">
        <van-cell
          title="服务人员"
          :value="selectedWorker ? selectedWorker.name : '请选择服务人员'"
          is-link
          @click="showWorkerPicker = true"
        />
        <van-cell
          title="服务地址"
          :value="selectedAddress ? formatAddress(selectedAddress) : '请选择服务地址'"
          is-link
          @click="goToAddressSelect"
        />
        <van-cell
          title="预约日期"
          :value="selectedDate || '请选择预约日期'"
          is-link
          @click="showCalendar = true"
        />
        <van-cell
          title="预约时间"
          :value="selectedTimeSlot || '请选择预约时间'"
          is-link
          @click="showTimePicker = true"
        />
        <van-cell title="服务数量">
          <template #right-icon>
            <van-stepper
              v-model="quantity"
              :min="1"
              :max="10"
              input-width="40px"
              button-size="24px"
            />
          </template>
        </van-cell>
        <van-field
          v-model="remark"
          rows="2"
          autosize
          label="备注"
          type="textarea"
          placeholder="请输入备注信息（选填）"
        />
      </van-cell-group>

      <van-calendar
        v-model:show="showCalendar"
        :min-date="minDate"
        :max-date="maxDate"
        color="#1989fa"
        @confirm="onDateConfirm"
      />

      <van-action-sheet
        v-model:show="showWorkerPicker"
        title="选择服务人员"
        :actions="workerActions"
        cancel-text="取消"
        @select="onWorkerSelect"
      />

      <van-action-sheet
        v-model:show="showTimePicker"
        title="选择预约时间"
        :actions="timeSlotActions"
        cancel-text="取消"
        @select="onTimeSlotSelect"
      />

      <div v-if="selectedAddress || selectedWorker || selectedDate" class="card mt-12">
        <h3 class="summary-title mb-8">预约信息</h3>
        <div class="summary-item flex-between">
          <span class="text-muted">服务名称</span>
          <span>{{ service.name }}</span>
        </div>
        <div class="summary-item flex-between mt-8">
          <span class="text-muted">服务人员</span>
          <span>{{ selectedWorker?.name || '待选择' }}</span>
        </div>
        <div class="summary-item flex-between mt-8">
          <span class="text-muted">服务地址</span>
          <span>{{ selectedAddress ? formatAddress(selectedAddress) : '待选择' }}</span>
        </div>
        <div class="summary-item flex-between mt-8">
          <span class="text-muted">预约时间</span>
          <span>{{ selectedDate }} {{ selectedTimeSlot || '' }}</span>
        </div>
        <div class="summary-item flex-between mt-8">
          <span class="text-muted">数量</span>
          <span>x{{ quantity }}</span>
        </div>
        <div class="summary-item flex-between mt-8">
          <span class="text-muted">合计金额</span>
          <span class="price">¥{{ totalPrice }}</span>
        </div>
      </div>
    </div>

    <van-submit-bar
      :price="totalPrice * 100"
      button-text="提交预约"
      :disabled="!canSubmit"
      @submit="submitBooking"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getServiceDetail, getTimeSlots } from '@/api/service'
import { getWorkerList } from '@/api/worker'
import { getAddressList } from '@/api/address'
import { createOrder } from '@/api/order'
import { createPayment } from '@/api/payment'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const serviceId = computed(() => route.params.id)
const service = ref(null)
const workers = ref([])
const addresses = ref([])
const selectedWorker = ref(null)
const selectedAddress = ref(null)
const selectedDate = ref('')
const selectedTimeSlot = ref('')
const timeSlots = ref([])
const quantity = ref(1)
const remark = ref('')
const showCalendar = ref(false)
const showWorkerPicker = ref(false)
const showTimePicker = ref(false)

const minDate = new Date()
const maxDate = new Date()
maxDate.setMonth(maxDate.getMonth() + 1)

const totalPrice = computed(() => {
  const price = service.value?.price || 0
  return (price * quantity.value).toFixed(2)
})

const canSubmit = computed(() => {
  return service.value && selectedWorker.value && selectedAddress.value && selectedDate.value && selectedTimeSlot.value
})

const workerActions = computed(() => {
  return workers.value.map(w => ({
    name: `${w.name} - ${w.skill || '专业技师'}`,
    id: w.id
  }))
})

const timeSlotActions = computed(() => {
  return timeSlots.value.map(t => ({
    name: t,
    disabled: !t
  }))
})

const formatAddress = (addr) => {
  if (!addr) return ''
  return `${addr.province}${addr.city}${addr.district}${addr.detail}`
}

const onBack = () => {
  router.back()
}

const onDateConfirm = (value) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  selectedDate.value = `${year}-${month}-${day}`
  showCalendar.value = false
  fetchTimeSlots()
}

const onWorkerSelect = (item) => {
  selectedWorker.value = workers.value.find(w => w.id === item.id)
}

const onTimeSlotSelect = (item) => {
  selectedTimeSlot.value = item.name
}

const goToAddressSelect = () => {
  router.push('/address?select=true')
}

const fetchServiceDetail = async () => {
  try {
    const res = await getServiceDetail(serviceId.value)
    service.value = res
  } catch (e) {
    showToast('获取服务详情失败')
  }
}

const fetchWorkers = async () => {
  try {
    const res = await getWorkerList({ serviceId: serviceId.value })
    workers.value = res.list || res.workers || []
  } catch (e) {
    showToast('获取服务人员失败')
  }
}

const fetchAddresses = async () => {
  try {
    const res = await getAddressList()
    addresses.value = res.list || res.addresses || []
    const defaultAddr = addresses.value.find(a => a.isDefault)
    if (defaultAddr) {
      selectedAddress.value = defaultAddr
    }
  } catch (e) {
    showToast('获取地址列表失败')
  }
}

const fetchTimeSlots = async () => {
  if (!selectedDate.value) return
  try {
    const res = await getTimeSlots(serviceId.value, selectedDate.value)
    timeSlots.value = res.list || res.slots || []
    showTimePicker.value = true
  } catch (e) {
    showToast('获取可预约时间失败')
  }
}

const submitBooking = async () => {
  if (!canSubmit.value) {
    showToast('请完善预约信息')
    return
  }

  try {
    const orderData = {
      serviceId: serviceId.value,
      workerId: selectedWorker.value.id,
      addressId: selectedAddress.value.id,
      appointmentDate: selectedDate.value,
      appointmentTime: selectedTimeSlot.value,
      quantity: quantity.value,
      remark: remark.value,
      totalAmount: totalPrice.value
    }

    const order = await orderStore.createOrder(orderData)
    showToast('预约提交成功')
    
    const payment = await createPayment(order.id, 'wechat')
    if (payment) {
      router.push(`/order/${order.id}`)
    }
  } catch (e) {
    console.error('提交预约失败', e)
  }
}

onMounted(() => {
  fetchServiceDetail()
  fetchWorkers()
  fetchAddresses()
})
</script>

<style lang="scss" scoped>
.service-card {
  padding: 0;
  overflow: hidden;

  .service-info {
    padding: 12px;
  }

  .service-name {
    font-size: 18px;
    font-weight: bold;
    color: #323233;
  }

  .service-desc {
    font-size: 14px;
    color: #646566;
    line-height: 1.6;
  }
}

.summary-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.summary-item {
  font-size: 14px;
  color: #323233;
}
</style>
