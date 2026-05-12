<template>
  <div class="register-page">
    <van-nav-bar
      title="骑手注册"
      left-arrow
      @click-left="$router.back()"
    />

    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="form.real_name"
          name="real_name"
          label="真实姓名"
          placeholder="请输入真实姓名"
          :rules="[{ required: true, message: '请输入真实姓名' }]"
        />
        <van-field
          v-model="form.id_card"
          name="id_card"
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="[{ required: true, message: '请输入身份证号' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <van-field
          v-model="form.confirm_password"
          type="password"
          name="confirm_password"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[{ required: true, message: '请确认密码' }]"
        />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>

      <div class="register-footer">
        <router-link to="/login">已有账号？立即登录</router-link>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useRiderStore } from '@/stores/rider'

const router = useRouter()
const riderStore = useRiderStore()

const loading = ref(false)
const form = reactive({
  username: '',
  phone: '',
  real_name: '',
  id_card: '',
  password: '',
  confirm_password: ''
})

async function handleSubmit() {
  if (form.password !== form.confirm_password) {
    showToast('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    await riderStore.handleRegister({
      username: form.username,
      password: form.password,
      phone: form.phone,
      real_name: form.real_name,
      id_card: form.id_card
    })
    showToast('注册成功，等待审核')
    router.push('/login')
  } catch (error: any) {
    showToast(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
}

.register-footer a {
  color: #1989fa;
  text-decoration: none;
  font-size: 14px;
}
</style>
