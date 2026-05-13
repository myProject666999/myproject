<template>
  <div class="login-page">
    <div class="login-header">
      <h2>欢迎回来</h2>
      <p>登录您的私教课程账号</p>
    </div>
    <van-form @submit="onLogin">
      <van-cell-group inset>
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          :rules="[{ required: true, message: '请输入手机号' }]"
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
      <div class="login-btn" style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
      <div class="login-links">
        <router-link to="/register">没有账号？立即注册</router-link>
      </div>
    </van-form>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Toast } from 'vant'
import { authAPI } from '@/api'

export default {
  setup() {
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const form = reactive({ phone: '', password: '' })

    const onLogin = async () => {
      loading.value = true
      try {
        const res = await authAPI.login(form)
        store.dispatch('login', { token: res.token, user: res.user })
        Toast.success('登录成功')
        setTimeout(() => router.push('/'), 500)
      } catch (e) {
      } finally {
        loading.value = false
      }
    }

    return { form, loading, onLogin }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  padding: 80px 0;
}
.login-header {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
}
.login-header h2 {
  font-size: 28px;
  margin-bottom: 8px;
}
.login-header p {
  opacity: 0.85;
}
.login-links {
  text-align: center;
  margin-top: 20px;
}
.login-links a {
  color: #fff;
  font-size: 14px;
}
</style>
