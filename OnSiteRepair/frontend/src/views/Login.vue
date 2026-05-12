<template>
  <div class="page-container">
    <van-nav-bar title="登录" />
    <div class="login-container">
      <div class="logo">
        <van-icon name="service-o" size="48" color="#1989fa" />
        <h2>上门维修服务平台</h2>
      </div>
      
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请填写手机号' }]"
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

        <van-radio-group v-model="form.userType" direction="horizontal" class="user-type">
          <van-radio name="1">我是用户</van-radio>
          <van-radio name="2">我是师傅</van-radio>
        </van-radio-group>

        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
      </van-form>

      <div class="links">
        <router-link to="/register">注册账号</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userLogin, workerLogin } from '@/api/user'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  phone: '',
  password: '',
  userType: '1'
})

const onSubmit = async () => {
  try {
    const loginApi = form.userType === '1' ? userLogin : workerLogin
    const res = await loginApi({
      phone: form.phone,
      password: form.password
    })
    userStore.setLogin({
      ...res,
      userType: parseInt(form.userType)
    })
    showToast('登录成功')
    router.push('/home')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.login-container {
  padding: 20px;
}

.logo {
  text-align: center;
  padding: 40px 0;
}

.logo h2 {
  margin-top: 15px;
  color: #333;
}

.user-type {
  padding: 15px;
  display: flex;
  justify-content: center;
  gap: 40px;
}

.links {
  text-align: center;
  margin-top: 20px;
}

.links a {
  color: #1989fa;
  text-decoration: none;
}
</style>
