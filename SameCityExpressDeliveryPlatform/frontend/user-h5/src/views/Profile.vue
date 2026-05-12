<template>
  <div class="profile-page page-container">
    <div class="profile-header" v-if="userInfo">
      <div class="avatar">{{ (userInfo.nickname || userInfo.username)[0] }}</div>
      <div class="user-info">
        <h3>{{ userInfo.nickname || userInfo.username }}</h3>
        <p>余额：<span class="price-highlight">¥{{ userInfo.balance?.toFixed(2) || '0.00' }}</span></p>
      </div>
    </div>

    <van-cell-group inset style="margin-top: 20px">
      <van-cell
        title="我的订单"
        is-link
        @click="$router.push('/order')"
      >
        <template #icon>
          <van-icon name="orders-o" />
        </template>
      </van-cell>
      <van-cell
        title="地址管理"
        is-link
        @click="$router.push('/address')"
      >
        <template #icon>
          <van-icon name="location-o" />
        </template>
      </van-cell>
      <van-cell
        title="异常工单"
        is-link
        @click="$router.push('/exception')"
      >
        <template #icon>
          <van-icon name="warning-o" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset style="margin-top: 20px">
      <van-cell
        title="个人信息"
        is-link
        @click="showEditProfile = true"
      >
        <template #icon>
          <van-icon name="user-o" />
        </template>
      </van-cell>
      <van-cell
        title="修改密码"
        is-link
        @click="showChangePassword = true"
      >
        <template #icon>
          <van-icon name="lock" />
        </template>
      </van-cell>
    </van-cell-group>

    <div style="margin: 30px 16px">
      <van-button round block type="danger" @click="logout">
        退出登录
      </van-button>
    </div>

    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/order" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>

    <van-popup
      v-model:show="showEditProfile"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="popup-header">
        <h3>编辑资料</h3>
        <van-icon name="cross" size="22" @click="showEditProfile = false" />
      </div>
      <van-form @submit="updateProfile">
        <van-cell-group>
          <van-field
            v-model="editProfileForm.nickname"
            label="昵称"
            placeholder="请输入昵称"
          />
          <van-field
            v-model="editProfileForm.phone"
            label="手机号"
            placeholder="请输入手机号"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit" :loading="profileLoading">
            保存
          </van-button>
        </div>
      </van-form>
    </van-popup>

    <van-popup
      v-model:show="showChangePassword"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="popup-header">
        <h3>修改密码</h3>
        <van-icon name="cross" size="22" @click="showChangePassword = false" />
      </div>
      <van-form @submit="changePassword">
        <van-cell-group>
          <van-field
            v-model="passwordForm.old_password"
            type="password"
            label="原密码"
            placeholder="请输入原密码"
          />
          <van-field
            v-model="passwordForm.new_password"
            type="password"
            label="新密码"
            placeholder="请输入新密码"
          />
          <van-field
            v-model="passwordForm.confirm_password"
            type="password"
            label="确认密码"
            placeholder="请再次输入新密码"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit" :loading="passwordLoading">
            保存
          </van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { updateProfile as updateProfileApi, changePassword as changePasswordApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const active = ref(2)
const userInfo = computed(() => userStore.userInfo)

const showEditProfile = ref(false)
const showChangePassword = ref(false)
const profileLoading = ref(false)
const passwordLoading = ref(false)

const editProfileForm = reactive({
  nickname: '',
  phone: ''
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

function logout() {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  }).catch(() => {
    // 用户取消
  })
}

async function updateProfile() {
  profileLoading.value = true
  try {
    await updateProfileApi(editProfileForm)
    showToast('更新成功')
    showEditProfile.value = false
    await userStore.fetchProfile()
  } catch (error: any) {
    showToast(error.message || '更新失败')
  } finally {
    profileLoading.value = false
  }
}

async function changePassword() {
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    showToast('两次输入的新密码不一致')
    return
  }

  passwordLoading.value = true
  try {
    await changePasswordApi(passwordForm.old_password, passwordForm.new_password)
    showToast('修改成功')
    showChangePassword.value = false
    userStore.logout()
    router.push('/login')
  } catch (error: any) {
    showToast(error.message || '修改失败')
  } finally {
    passwordLoading.value = false
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
    if (userInfo.value) {
      editProfileForm.nickname = userInfo.value.nickname || ''
      editProfileForm.phone = userInfo.value.phone || ''
    }
  }
})
</script>

<style scoped>
.profile-page {
  padding-bottom: 60px;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  font-weight: 600;
  margin-right: 15px;
}

.user-info {
  color: #fff;
}

.user-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-info p {
  font-size: 14px;
  opacity: 0.9;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebedf0;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
</style>
