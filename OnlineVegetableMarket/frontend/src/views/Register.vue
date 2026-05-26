<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-title">🥬 鲜时达</div>
      <div class="login-subtitle">创建您的账号</div>
      
      <van-form @submit="handleRegister">
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
            placeholder="请输入密码（至少6位）"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
          <van-field
            v-model="form.phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }]"
          />
          <van-field
            v-model="form.address"
            type="textarea"
            label="地址"
            placeholder="请输入收货地址"
            autosize
          />
        </van-cell-group>
        
        <div style="margin: 24px 16px 0;">
          <van-button round block type="primary" native-type="submit">
            注册
          </van-button>
        </div>
      </van-form>
      
      <div class="login-link">
        已有账号？<router-link to="/login">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  phone: '',
  address: '',
})

async function handleRegister() {
  try {
    await userStore.register(form)
    showToast('注册成功')
    router.push('/')
  } catch (e) {
    // error handled in interceptor
  }
}
</script>
