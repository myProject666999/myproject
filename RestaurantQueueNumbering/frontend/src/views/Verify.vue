<template>
  <div class="page-container">
    <van-nav-bar
      title="核验取号"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="content-wrapper">
      <div class="card verify-card">
        <div class="verify-icon">
          <van-icon name="qr" size="64" color="#1989fa" />
        </div>
        <h3 style="text-align: center; margin-top: 16px;">预约核验</h3>
        <p class="text-gray" style="text-align: center; margin-top: 8px;">
          请输入核验码或扫描二维码
        </p>
      </div>

      <div class="card">
        <h3 style="font-weight: 600; margin-bottom: 16px;">核验信息</h3>
        <van-field
          v-model="reservationId"
          label="预约号"
          placeholder="请输入预约号"
          type="number"
        />
        <van-field
          v-model="verifyCode"
          label="核验码"
          placeholder="请输入6位核验码"
          maxlength="6"
        />
        <van-field
          v-model="restaurantId"
          label="餐厅ID"
          placeholder="请输入餐厅ID"
          type="number"
          style="display: none;"
        />

        <van-button
          type="primary"
          size="large"
          block
          :disabled="!canVerify || verifying"
          class="btn-primary"
          style="margin-top: 20px;"
          @click="doVerify"
        >
          {{ verifying ? '核验中...' : '立即核验' }}
        </van-button>
      </div>

      <div class="card" v-if="verifyResult">
        <h3 style="font-weight: 600; margin-bottom: 12px;">核验结果</h3>
        <van-icon
          :name="verifyResult.success ? 'checked-circle' : 'cross-circle'"
          :color="verifyResult.success ? '#07c160' : '#ee0a24'"
          size="48"
          style="display: block; margin: 0 auto 12px;"
        />
        <p :style="{ textAlign: 'center', color: verifyResult.success ? '#07c160' : '#ee0a24' }">
          {{ verifyResult.message }}
        </p>

        <div v-if="verifyResult.queue" style="margin-top: 16px;">
          <div class="result-item">
            <span class="text-gray">排队号</span>
            <span style="font-size: 24px; font-weight: bold; color: #1989fa;">
              {{ verifyResult.queue.queue_no }}
            </span>
          </div>
          <div class="result-item">
            <span class="text-gray">当前位次</span>
            <span style="font-weight: 600;">第 {{ verifyResult.queue.position }} 位</span>
          </div>
          <div class="result-item">
            <span class="text-gray">预估等待</span>
            <span class="text-warning">{{ verifyResult.queue.estimated_wait_time }} 分钟</span>
          </div>
        </div>

        <van-button
          v-if="verifyResult.queue"
          type="primary"
          block
          style="margin-top: 16px;"
          @click="goToMyQueue"
        >
          查看排队详情
        </van-button>
      </div>

      <div class="card tips-card">
        <h4 style="font-weight: 600; margin-bottom: 8px;">
          <van-icon name="info-o" /> 核验须知
        </h4>
        <ul class="tips-list">
          <li>请在预约时间前30分钟内到店核验</li>
          <li>核验成功后自动加入排队队列</li>
          <li>超过预约时间30分钟未核验，预约自动失效</li>
          <li>核验码为6位数字，请注意保密</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reservationApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const reservationId = ref('')
const verifyCode = ref('')
const restaurantId = ref('1')
const verifying = ref(false)
const verifyResult = ref(null)

const canVerify = computed(() => {
  return reservationId.value.length > 0 && verifyCode.value.length === 6
})

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (route.query.reservation_id) {
    reservationId.value = route.query.reservation_id
  }
  if (route.query.verify_code) {
    verifyCode.value = route.query.verify_code
  }
})

async function doVerify() {
  if (!canVerify.value) {
    showToast('请完善核验信息')
    return
  }

  try {
    verifying.value = true
    const result = await reservationApi.verify({
      reservation_id: Number(reservationId.value),
      verify_code: verifyCode.value,
      operator_id: userStore.userInfo.id
    })

    verifyResult.value = {
      success: true,
      message: '核验成功，已加入排队队列',
      queue: result.queue
    }
  } catch (e) {
    verifyResult.value = {
      success: false,
      message: e.message || '核验失败'
    }
  } finally {
    verifying.value = false
  }
}

function goToMyQueue() {
  router.push('/my-queue')
}
</script>

<style lang="less" scoped>
.verify-card {
  text-align: center;
  background: linear-gradient(135deg, #e8f3ff 0%, #f5f9ff 100%);
}

.verify-icon {
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.15);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.tips-card {
  background: #fffbe6;

  .tips-list {
    padding-left: 20px;
    color: #666;
    font-size: 13px;
    line-height: 1.8;

    li {
      margin-bottom: 4px;
    }
  }
}
</style>
