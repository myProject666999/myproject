<template>
  <div class="register-page">
    <van-nav-bar title="注册账号" left-arrow @click-left="$router.back()" />
    <van-form @submit="onRegister">
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
          v-model="form.name"
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码（至少6位）"
          :rules="[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]"
        />
        <van-field
          v-model="form.gender"
          name="gender"
          label="性别"
          readonly
          is-link
          placeholder="请选择性别"
          @click="showGenderPicker = true"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>
      <div class="login-links">
        <router-link to="/login">已有账号？立即登录</router-link>
      </div>
    </van-form>
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        @confirm="onConfirmGender"
        @cancel="showGenderPicker = false"
        show-toolbar
        title="选择性别"
      />
    </van-popup>
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
    const showGenderPicker = ref(false)
    const genderColumns = [
      { text: '男', value: 'male' },
      { text: '女', value: 'female' }
    ]
    const form = reactive({ phone: '', name: '', password: '', gender: 'male' })

    const onConfirmGender = ({ value, text }) => {
      form.gender = value
      showGenderPicker.value = false
    }

    const onRegister = async () => {
      loading.value = true
      try {
        const res = await authAPI.register(form)
        store.dispatch('login', { token: res.token, user: res.user })
        Toast.success('注册成功')
        setTimeout(() => router.push('/'), 500)
      } catch (e) {
      } finally {
        loading.value = false
      }
    }

    return { form, loading, showGenderPicker, genderColumns, onConfirmGender, onRegister }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.login-links {
  text-align: center;
  margin-top: 20px;
}
.login-links a {
  color: #1989fa;
  font-size: 14px;
}
</style>
