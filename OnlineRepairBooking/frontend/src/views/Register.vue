<template>
  <div class="register">
    <van-nav-bar title="注册" fixed placeholder @click-left="onClickLeft" />
    
    <div class="register-container">
      <div class="header-section">
        <h2 class="page-title">创建账号</h2>
        <p class="page-desc">填写以下信息完成注册</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            type="tel"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请填写手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
            maxlength="11"
          />
          <van-field
            v-model="form.username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[
              { required: true, message: '请填写用户名' },
              { min: 2, max: 20, message: '用户名长度为2-20个字符' }
            ]"
          />
          <van-field
            v-model="form.password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[
              { required: true, message: '请填写密码' },
              { min: 6, max: 20, message: '密码长度为6-20个字符' }
            ]"
          />
          <van-field
            v-model="form.confirmPassword"
            type="password"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请再次输入密码' },
              { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
            ]"
          />
        </van-cell-group>

        <div class="button-group">
          <van-button
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            class="register-button"
          >
            注册
          </van-button>
        </div>
      </van-form>

      <div class="links">
        <router-link to="/login" class="link">
          已有账号？立即登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = ref({
  phone: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (value) => {
  return value === form.value.password
}

const onSubmit = async (values) => {
  try {
    loading.value = true
    const { confirmPassword, ...registerData } = values
    await userStore.register(registerData)
    showToast('注册成功，请登录')
    router.replace('/login')
  } catch (err) {
    showToast(err.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const onClickLeft = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.register {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.register-container {
  padding: 20px;
}

.header-section {
  text-align: center;
  margin: 20px 0 32px;

  .page-title {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: bold;
    color: #323233;
  }

  .page-desc {
    margin: 0;
    font-size: 14px;
    color: #969799;
  }
}

.button-group {
  margin-top: 32px;
  padding: 0 16px;

  .register-button {
    border-radius: 20px;
  }
}

.links {
  margin-top: 24px;
  text-align: center;

  .link {
    font-size: 14px;
    color: #1989fa;
    text-decoration: none;
  }
}
</style>
