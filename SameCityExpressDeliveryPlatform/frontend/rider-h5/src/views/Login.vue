<template>
  <div class="login-page">
    <div class="logo-section">
      <div class="logo">🚴</div>
      <h2>同城速运 - 骑手端</h2>
      <p>接单赚钱，时间自由</p>
    </div>

    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.login"
          name="login"
          label="账号"
          placeholder="请输入用户名或手机号"
          :rules="[{ required: true, message: '请输入账号' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>

      <div class="login-footer">
        <router-link to="/register">还没有账号？立即注册</router-link>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useRiderStore } from '@/stores/rider'

const router = useRouter()
const route = useRoute()
const riderStore = useRiderStore()

const loading = ref(false)
const form = reactive({
  login: '',
  password: ''
})

async function handleSubmit() {
  loading.value = true
  try {
    await riderStore.handleLogin(form.login, form.password)
    showToast('登录成功')
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    showToast(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
  padding: 50px 20px;
}

.logo-section {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
}

.logo {
  font-size: 60px;
  margin-bottom: 10px;
}

.logo-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.logo-section p {
  font-size: 14px;
  opacity: 0.9;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer a {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
}
</style>
