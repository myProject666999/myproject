<template>
  <div class="page-container">
    <van-nav-bar title="个人中心" />
    
    <div class="profile-header">
      <van-avatar size="64" icon="user-o" />
      <div class="profile-info">
        <h2>{{ userInfo.nickname || '游客' }}</h2>
        <p v-if="isLogin">{{ userInfo.phone }}</p>
        <van-button
          size="small"
          :type="isLogin ? 'default' : 'primary'"
          @click="toggleLogin"
        >
          {{ isLogin ? '退出登录' : '登录/注册' }}
        </van-button>
      </div>
    </div>

    <van-grid :column-num="4" :border="false">
      <van-grid-item icon="orders-o" text="我的订单" @click="router.push('/orders')" />
      <van-grid-item icon="star-o" text="我的评价" @click="router.push('/reviews')" />
      <van-grid-item icon="qr" text="入园签到" @click="router.push('/checkin')" />
      <van-grid-item icon="heart-o" text="我的收藏" />
    </van-grid>

    <van-cell-group inset style="margin-top: 12px">
      <van-cell title="预订须知" is-link @click="router.push('/notice')" />
      <van-cell title="联系客服" is-link @click="router.push('/contact')" />
      <van-cell title="关于我们" is-link @click="router.push('/about')" />
      <van-cell title="设置" is-link @click="router.push('/settings')" />
    </van-cell-group>

    <van-popup v-model:show="showLoginPopup" position="bottom" :style="{ height: '70%' }">
      <div class="login-popup">
        <div class="login-header">
          <h3>欢迎登录</h3>
          <p>登录后可预订营位</p>
        </div>
        
        <van-tabs v-model:active="loginTab">
          <van-tab title="登录">
            <div class="login-form">
              <van-field
                v-model="loginForm.phone"
                type="tel"
                label="手机号"
                placeholder="请输入手机号"
                maxlength="11"
                clearable
              />
              <van-field
                v-model="loginForm.password"
                type="password"
                label="密码"
                placeholder="请输入密码"
                clearable
              />
              <van-button type="primary" block size="large" :loading="submitting" @click="handleLogin">
                登录
              </van-button>
              <div class="login-tip">
                <span>测试账号：13800138000 / 123456</span>
              </div>
            </div>
          </van-tab>
          <van-tab title="注册">
            <div class="login-form">
              <van-field
                v-model="registerForm.phone"
                type="tel"
                label="手机号"
                placeholder="请输入手机号"
                maxlength="11"
                clearable
              />
              <van-field
                v-model="registerForm.nickname"
                label="昵称"
                placeholder="请输入昵称"
                clearable
              />
              <van-field
                v-model="registerForm.password"
                type="password"
                label="密码"
                placeholder="请输入密码"
                clearable
              />
              <van-field
                v-model="registerForm.confirmPassword"
                type="password"
                label="确认密码"
                placeholder="请再次输入密码"
                clearable
              />
              <van-button type="primary" block size="large" :loading="submitting" @click="handleRegister">
                注册
              </van-button>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </van-popup>

    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/map" icon="map">地图</van-tabbar-item>
      <van-tabbar-item replace to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { login as loginApi, register as registerApi } from '@/api/users'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref(3)

const userInfo = ref({
  nickname: '',
  phone: ''
})

const isLogin = ref(false)
const showLoginPopup = ref(false)
const loginTab = ref(0)
const submitting = ref(false)

const loginForm = reactive({
  phone: '',
  password: ''
})

const registerForm = reactive({
  phone: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const toggleLogin = async () => {
  if (isLogin.value) {
    try {
      await showConfirmDialog({
        title: '确认退出',
        message: '确定要退出登录吗？'
      })
      userStore.logout()
      userInfo.value = { nickname: '', phone: '' }
      isLogin.value = false
      showToast('已退出登录')
    } catch {
      console.log('取消退出')
    }
  } else {
    showLoginPopup.value = true
  }
}

const handleLogin = async () => {
  if (!loginForm.phone) {
    showToast('请输入手机号')
    return
  }
  if (!loginForm.password) {
    showToast('请输入密码')
    return
  }
  if (!/^1\d{10}$/.test(loginForm.phone)) {
    showToast('手机号格式不正确')
    return
  }

  try {
    submitting.value = true
    const response = await loginApi(loginForm)
    if (response && response.success && response.data) {
      localStorage.setItem('token', response.data.token)
      userStore.setUserInfo(response.data.user)
      userInfo.value = response.data.user
      isLogin.value = true
      showLoginPopup.value = false
      showToast('登录成功')
      
      loginForm.phone = ''
      loginForm.password = ''
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.phone) {
    showToast('请输入手机号')
    return
  }
  if (!/^1\d{10}$/.test(registerForm.phone)) {
    showToast('手机号格式不正确')
    return
  }
  if (!registerForm.nickname) {
    showToast('请输入昵称')
    return
  }
  if (!registerForm.password) {
    showToast('请输入密码')
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    showToast('两次密码不一致')
    return
  }

  try {
    submitting.value = true
    const response = await registerApi({
      phone: registerForm.phone,
      password: registerForm.password,
      nickname: registerForm.nickname
    })
    if (response && response.success && response.data) {
      localStorage.setItem('token', response.data.token)
      userStore.setUserInfo(response.data.user)
      userInfo.value = response.data.user
      isLogin.value = true
      showLoginPopup.value = false
      showToast('注册成功')
      
      registerForm.phone = ''
      registerForm.nickname = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    }
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  userStore.restoreLogin()
  if (userStore.isLogin) {
    isLogin.value = true
    userInfo.value = userStore.userInfo || {}
  }
})
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  padding: 24px 16px;
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  color: #fff;
}

.profile-info {
  margin-left: 20px;
  flex: 1;
}

.profile-info h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.profile-info p {
  margin: 0 0 12px 0;
  font-size: 14px;
  opacity: 0.9;
}

.login-popup {
  padding: 20px;
}

.login-header {
  text-align: center;
  padding: 20px 0;
}

.login-header h3 {
  margin: 0 0 8px 0;
  color: #323233;
}

.login-header p {
  margin: 0;
  color: #969799;
  font-size: 14px;
}

.login-form {
  padding: 20px 0;
}

.login-tip {
  text-align: center;
  padding: 16px 0;
  font-size: 12px;
  color: #969799;
}
</style>
