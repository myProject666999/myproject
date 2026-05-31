<template>
  <div class="login-container">
    <div class="login-header">
      <div class="logo">
        <van-icon name="shop-o" size="64" color="#1989fa" />
      </div>
      <h2>餐厅排队叫号系统</h2>
      <p class="text-gray">便捷取号 · 实时叫号 · 智能预约</p>
    </div>

    <div class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </van-cell-group>

      <van-button
        type="primary"
        size="large"
        block
        :disabled="!validPhone || loggingIn"
        class="btn-primary"
        style="margin: 24px 16px 0;"
        @click="login"
      >
        {{ loggingIn ? '登录中...' : '登录 / 注册' }}
      </van-button>

      <p class="tip">
        未注册的手机号将自动创建账号
      </p>
    </div>

    <div class="quick-login">
      <p class="text-gray" style="margin-bottom: 12px;">快速体验</p>
      <div class="quick-btns">
        <van-button size="small" plain @click="quickLogin('13800138001')">张三</van-button>
        <van-button size="small" plain @click="quickLogin('13800138002')">李四</van-button>
        <van-button size="small" plain @click="quickLogin('13800138003')">王五</van-button>
      </div>
    </div>

    <div class="merchant-entry">
      <p class="text-gray" style="margin-bottom: 12px;">商家入口</p>
      <div class="quick-btns">
        <van-button size="small" type="primary" @click="merchantLogin(1)">
          川味轩叫号台
        </van-button>
        <van-button size="small" type="primary" @click="merchantLogin(2)">
          粤港叫号台
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const loggingIn = ref(false)

const validPhone = computed(() => /^1[3-9]\d{9}$/.test(phone.value))

async function login() {
  if (!validPhone.value) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    loggingIn.value = true
    const user = await userApi.login(phone.value)
    userStore.setUser(user)
    showToast('登录成功')
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (e) {
    console.error(e)
  } finally {
    loggingIn.value = false
  }
}

async function quickLogin(p) {
  phone.value = p
  await login()
}

async function merchantLogin(restaurantId) {
  phone.value = '1390013900' + restaurantId
  try {
    loggingIn.value = true
    const user = await userApi.login(phone.value)
    userStore.setUser(user)
    showToast('登录成功')
    setTimeout(() => {
      router.push(`/merchant/${restaurantId}`)
    }, 500)
  } catch (e) {
    console.error(e)
  } finally {
    loggingIn.value = false
  }
}
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f3ff 0%, #f5f5f5 50%);
  padding: 40px 0;
}

.login-header {
  text-align: center;
  padding: 40px 20px;

  h2 {
    margin-top: 20px;
    font-size: 24px;
    color: #333;
  }

  p {
    margin-top: 8px;
    font-size: 14px;
  }
}

.logo {
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.15);
}

.tip {
  text-align: center;
  color: #969799;
  font-size: 12px;
  margin-top: 16px;
}

.quick-login,
.merchant-entry {
  margin-top: 40px;
  padding: 0 16px;
  text-align: center;
}

.quick-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
