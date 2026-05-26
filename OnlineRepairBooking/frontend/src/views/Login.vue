<template>
  <div class="login">
    <van-nav-bar title="登录" fixed placeholder @click-left="onClickLeft" />
    
    <div class="login-container">
      <div class="logo-section">
        <van-image
          round
          width="80"
          height="80"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        />
        <h2 class="app-title">在线维修预约</h2>
        <p class="app-desc">专业维修，快速上门</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            type="tel"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请填写手机号' }]"
            maxlength="11"
          />
          <van-field
            v-model="form.password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>

        <div class="button-group">
          <van-button
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            class="login-button"
          >
            登录
          </van-button>
        </div>
      </van-form>

      <div class="links">
        <router-link to="/register" class="link">
          没有账号？立即注册
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
  password: ''
})

const onSubmit = async (values) => {
  try {
    loading.value = true
    await userStore.login(values)
    showToast('登录成功')
    router.replace('/')
  } catch (err) {
    showToast(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const onClickLeft = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.login-container {
  padding: 40px 20px;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;

  .app-title {
    margin: 16px 0 8px;
    font-size: 24px;
    font-weight: bold;
    color: #323233;
  }

  .app-desc {
    margin: 0;
    font-size: 14px;
    color: #969799;
  }
}

.button-group {
  margin-top: 32px;
  padding: 0 16px;

  .login-button {
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
