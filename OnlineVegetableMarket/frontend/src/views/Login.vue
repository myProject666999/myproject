<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-title">🥬 鲜时达</div>
      <div class="login-subtitle">新鲜蔬菜，按时送达</div>
      
      <van-form @submit="handleLogin">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
        </van-cell-group>
        
        <div style="margin: 24px 16px 0;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
      </van-form>
      
      <div class="login-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
      
      <div style="margin-top: 16px; text-align: center; font-size: 12px; color: #999;">
        <div>测试账号: customer / 123456 (普通用户)</div>
        <div>商家账号: merchant / 123456 (商家后台)</div>
        <div>管理员: admin / 123456 (管理员)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  try {
    await userStore.login(form.username, form.password)
    showToast('登录成功')
    const redirect = route.query.redirect || '/'
    if (userStore.role === 'merchant' || userStore.role === 'admin') {
      router.push('/merchant')
    } else {
      router.push(redirect)
    }
  } catch (e) {
    // error handled in interceptor
  }
}
</script>
