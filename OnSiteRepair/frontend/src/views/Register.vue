<template>
  <div class="page-container">
    <van-nav-bar title="注册" left-text="返回" @click-left="onClickLeft" />
    <div class="register-container">
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
            v-model="form.nickname"
            name="nickname"
            label="昵称"
            placeholder="请输入昵称"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码(6-20位)"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>

        <van-radio-group v-model="form.userType" direction="horizontal" class="user-type">
          <van-radio name="1">用户注册</van-radio>
          <van-radio name="2">师傅注册</van-radio>
        </van-radio-group>

        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            注册
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userRegister, workerRegister } from '@/api/user'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  phone: '',
  nickname: '',
  password: '',
  userType: '1'
})

const onClickLeft = () => {
  router.back()
}

const onSubmit = async () => {
  try {
    const registerApi = form.userType === '1' ? userRegister : workerRegister
    const res = await registerApi({
      phone: form.phone,
      password: form.password,
      nickname: form.nickname
    })
    userStore.setLogin({
      ...res,
      userType: parseInt(form.userType)
    })
    showToast('注册成功')
    router.push('/home')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.register-container {
  padding: 20px;
}

.user-type {
  padding: 15px;
  display: flex;
  justify-content: center;
  gap: 40px;
}
</style>
