<template>
  <div class="page-container">
    <van-nav-bar title="入园签到" left-arrow @click-left="router.back()" />
    
    <div class="checkin-header">
      <van-icon name="qr" size="60" color="#07c160" />
      <h2>扫码入园签到</h2>
      <p>请扫描营位二维码或输入订单号</p>
    </div>

    <van-cell-group inset>
      <van-field
        v-model="orderNo"
        label="订单号"
        placeholder="请输入订单号"
        clearable
      />
      <van-field
        v-model="phone"
        label="手机号"
        placeholder="请输入预订手机号"
        type="tel"
        maxlength="11"
        clearable
      />
    </van-cell-group>

    <div class="checkin-actions">
      <van-button type="primary" block size="large" :disabled="!orderNo || !phone" @click="onCheckin">
        确认签到
      </van-button>
      <van-button plain type="primary" block size="large" style="margin-top: 16px" @click="onScan">
        <van-icon name="scan" /> 扫描二维码
      </van-button>
    </div>

    <div class="section-title">今日待签到</div>
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有待签到订单"
      @load="onLoad"
    >
      <van-cell
        v-for="item in orders"
        :key="item.id"
        is-link
        @click="quickCheckin(item)"
      >
        <template #title>
          {{ item.campsite_name }}
          <van-tag :type="getStatusType(item.status)" size="small" class="status-tag">
            {{ getStatusLabel(item.status) }}
          </van-tag>
        </template>
        <template #label>
          订单号: {{ item.order_no }}
        </template>
      </van-cell>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const orderNo = ref('')
const phone = ref('')
const loading = ref(false)
const finished = ref(true)

const orders = ref([
  { id: 1, order_no: 'CS202605130001', campsite_name: '帐篷区A01', status: 'paid' },
  { id: 2, order_no: 'CS202605130002', campsite_name: '房车区B01', status: 'paid' }
])

const onLoad = () => {
  loading.value = false
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    paid: 'primary',
    checked_in: 'success',
    checked_out: 'default',
    cancelled: 'danger'
  }
  return types[status] || 'default'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待支付',
    paid: '已支付',
    checked_in: '已签到',
    checked_out: '已离店',
    cancelled: '已取消'
  }
  return labels[status] || '未知'
}

const onCheckin = async () => {
  try {
    await showConfirmDialog({
      title: '确认签到',
      message: `确认对订单 ${orderNo.value} 进行签到？`
    })
    showToast('签到成功')
    router.back()
  } catch {
    console.log('取消签到')
  }
}

const onScan = () => {
  showToast('请在真机上测试扫码功能')
}

const quickCheckin = (item) => {
  orderNo.value = item.order_no
  showToast(`已选择订单: ${item.order_no}`)
}
</script>

<style scoped>
.checkin-header {
  text-align: center;
  padding: 40px 20px;
}

.checkin-header h2 {
  margin: 16px 0 8px 0;
  color: #323233;
}

.checkin-header p {
  margin: 0;
  color: #969799;
  font-size: 14px;
}

.checkin-actions {
  padding: 20px 16px;
}

.status-tag {
  margin-left: 8px;
}
</style>
