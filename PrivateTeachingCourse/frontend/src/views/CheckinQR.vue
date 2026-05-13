<template>
  <div class="checkin-page">
    <van-nav-bar title="上课签到" left-arrow @click-left="$router.back()" />
    <div class="qr-container">
      <van-loading v-if="loading" />
      <template v-else>
        <div class="qr-tip">请出示此二维码给教练扫描</div>
        <div class="qr-code-wrapper">
          <canvas ref="qrCanvas" width="256" height="256"></canvas>
        </div>
        <div v-if="checkin" class="checkin-info">
          <div class="info-label">课程</div>
          <div class="info-value">{{ checkin.Course?.name }}</div>
          <div class="info-label">时间</div>
          <div class="info-value">{{ checkin.Course?.date }} {{ checkin.Course?.startTime }}-{{ checkin.Course?.endTime }}</div>
          <div class="info-label">状态</div>
          <div class="info-value" :class="statusClass">
            {{ checkin.status === 'used' ? '已签到' : checkin.status === 'expired' ? '已过期' : '待签到' }}
          </div>
        </div>
        <div class="valid-tip">
          <van-icon name="info-o" /> 二维码上课前30分钟可生成，1小时内有效
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'
import { checkinAPI } from '@/api'

export default {
  setup() {
    const route = useRoute()
    const qrCanvas = ref(null)
    const loading = ref(true)
    const checkin = ref(null)

    const statusClass = computed(() => {
      if (!checkin.value) return ''
      return {
        used: 'text-success',
        scanned: 'text-success',
        generated: 'text-primary',
        expired: 'text-muted'
      }[checkin.value.status] || ''
    })

    const loadCheckin = async () => {
      try {
        const res = await checkinAPI.generateQR(route.params.bookingId)
        checkin.value = res.checkin
        if (qrCanvas.value && res.checkin.qrCode) {
          await QRCode.toCanvas(qrCanvas.value, res.checkin.qrCode, { width: 256 })
        }
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadCheckin)
    return { qrCanvas, loading, checkin, statusClass }
  }
}
</script>

<style scoped>
.checkin-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.qr-container {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qr-tip {
  font-size: 16px;
  color: #323233;
  margin-bottom: 24px;
}
.qr-code-wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.checkin-info {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
}
.info-label {
  font-size: 12px;
  color: #969799;
  margin-top: 8px;
}
.info-value {
  font-size: 15px;
  color: #323233;
  margin-top: 2px;
}
.valid-tip {
  font-size: 12px;
  color: #969799;
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
