<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">♻️</div>
      <h1>二手回收平台</h1>
      <p>让回收变得简单</p>
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
          登录
        </van-button>
        <van-button plain type="primary" round block @click="goRegister">
          注册账号
        </van-button>
      </div>

      <div class="test-accounts">
        <p>测试账号：</p>
        <p>用户：user1 / 123456</p>
        <p>回收员：collector1 / 123456</p>
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
  username: 'user1',
  password: '123456'
})

const onSubmit = async () => {
  try {
    showLoadingToast({ message: '登录中...', duration: 0 })
    const res = await authApi.login(form.value)
    
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userRole', res.data.role)
    localStorage.setItem('userId', res.data.userId)
    
    closeToast()
    showToast('登录成功')
    
    if (res.data.role === 'COLLECTOR') {
      router.push('/collector')
    } else {
      router.push('/home')
    }
  } catch (e) {
    closeToast()
  }
}

const goRegister = () => router.push('/register')
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #07c160 0%, #69d17c 100%);
  padding-top: 60px;
  
  .login-header {
    text-align: center;
    color: white;
    margin-bottom: 40px;
    
    .logo {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
    }
    
    p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
  }
  
  .btn-group {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .test-accounts {
    padding: 16px;
    text-align: center;
    color: rgba(255,255,255,0.8);
    font-size: 12px;
    
    p {
      margin: 4px 0;
    }
  }
}
</style>
