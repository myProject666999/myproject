<template>
  <div class="login-page">
    <van-nav-bar title="注册" left-arrow @click-left="router.back()" fixed placeholder />

    <div class="login-header">
      <div class="logo">♻️</div>
      <h1>创建账号</h1>
    </div>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]"
        />
        <van-field
          v-model="form.nickname"
          name="nickname"
          label="昵称"
          placeholder="请输入昵称（选填）"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>

      <div class="btn-group">
        <van-button type="primary" round block native-type="submit">
          注册
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { authApi } from '@/api'

const router = useRouter()

const form = ref({
  username: '',
  phone: '',
  nickname: '',
  password: ''
})

const onSubmit = async () => {
  try {
    showLoadingToast({ message: '注册中...', duration: 0 })
    await authApi.register(form.value)
    closeToast()
    showToast('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    closeToast()
  }
}
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #07c160 0%, #69d17c 100%);
  padding-top: 20px;
  
  .login-header {
    text-align: center;
    color: white;
    margin-bottom: 24px;
    
    .logo {
      font-size: 48px;
      margin-bottom: 12px;
    }
    
    h1 {
      margin: 0;
      font-size: 20px;
    }
  }
  
  .btn-group {
    padding: 16px;
  }
}
</style>
