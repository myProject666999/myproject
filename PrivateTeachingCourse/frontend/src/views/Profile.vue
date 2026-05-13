<template>
  <div class="profile-page">
    <div class="profile-header" v-if="user">
      <van-image
        round
        width="72"
        height="72"
        :src="user.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
      />
      <div class="profile-info">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-role">{{ user.role === 'coach' ? '教练' : user.role === 'admin' ? '管理员' : '学员' }}</div>
      </div>
    </div>

    <van-cell-group inset class="menu-group">
      <van-cell title="我的预约" icon="orders-o" is-link @click="$router.push('/bookings')" />
      <van-cell title="我的训练" icon="clock-o" is-link @click="$router.push('/trainings')" />
      <van-cell title="体测数据" icon="chart-trending-o" is-link @click="$router.push('/body-tests')" />
    </van-cell-group>

    <van-cell-group inset class="menu-group">
      <van-cell title="编辑资料" icon="edit" is-link @click="$router.push('/profile-edit')" />
      <van-cell title="修改密码" icon="locked" is-link @click="showPasswordDialog = true" />
    </van-cell-group>

    <van-cell-group inset class="menu-group">
      <van-cell title="关于我们" icon="info-o" is-link @click="showAboutDialog = true" />
      <van-cell title="退出登录" icon="log-out" is-link @click="handleLogout" />
    </van-cell-group>

    <van-dialog
      v-model:show="showPasswordDialog"
      title="修改密码"
      show-cancel-button
      @confirm="handleChangePassword"
    >
      <div style="padding: 16px">
        <van-field v-model="passwordForm.old" placeholder="当前密码" type="password" />
        <van-field v-model="passwordForm.new" placeholder="新密码" type="password" />
        <van-field v-model="passwordForm.confirm" placeholder="确认新密码" type="password" />
      </div>
    </van-dialog>

    <van-dialog
      v-model:show="showAboutDialog"
      title="关于我们"
      show-cancel-button
    >
      <div style="padding: 20px; text-align: center; line-height: 1.8">
        <h3 style="margin-bottom: 16px">私教课程预约打卡平台</h3>
        <p>版本：1.0.0</p>
        <p>专业的私教预约、训练记录、学员社区平台</p>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
import { authAPI } from '@/api'

export default {
  setup() {
    const router = useRouter()
    const store = useStore()
    const user = computed(() => store.state.user)
    const showPasswordDialog = ref(false)
    const showAboutDialog = ref(false)
    const passwordForm = ref({ old: '', new: '', confirm: '' })

    const loadProfile = async () => {
      try {
        const res = await authAPI.getProfile()
        store.dispatch('updateUser', res.user)
      } catch (e) {
        console.error(e)
      }
    }

    const handleChangePassword = async () => {
      if (!passwordForm.value.old || !passwordForm.value.new) {
        showFailToast('请填写完整信息')
        return false
      }
      if (passwordForm.value.new !== passwordForm.value.confirm) {
        showFailToast('两次密码不一致')
        return false
      }
      try {
        await authAPI.changePassword({
          oldPassword: passwordForm.value.old,
          newPassword: passwordForm.value.new
        })
        showSuccessToast('密码修改成功')
        showPasswordDialog.value = false
        passwordForm.value = { old: '', new: '', confirm: '' }
      } catch (e) {
        return false
      }
    }

    const handleLogout = async () => {
      try {
        await showConfirmDialog({ title: '退出登录', message: '确定要退出登录吗？' })
        store.dispatch('logout')
        router.push('/login')
      } catch (e) {
        if (e !== 'cancel') console.error(e)
      }
    }

    onMounted(loadProfile)
    return {
      user, showPasswordDialog, showAboutDialog, passwordForm,
      handleChangePassword, handleLogout
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}
.profile-header {
  background: linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  color: #fff;
}
.profile-info {
  margin-left: 16px;
}
.user-name {
  font-size: 20px;
  font-weight: 600;
}
.user-role {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 4px;
}
.menu-group {
  margin-top: 12px;
}
</style>
