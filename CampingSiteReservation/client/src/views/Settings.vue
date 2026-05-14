<template>
  <div class="page-container">
    <van-nav-bar title="设置" left-arrow @click-left="router.back()" />
    
    <div class="content">
      <van-cell-group inset>
        <van-cell title="消息通知" is-link @click="showNotification" />
        <van-cell title="隐私设置" is-link @click="showPrivacy" />
        <van-cell title="通用设置" is-link @click="showGeneral" />
      </van-cell-group>

      <van-cell-group inset style="margin-top: 12px">
        <van-cell title="清除缓存" is-link @click="clearCache">
          <template #value>
            <span class="cache-size">2.5MB</span>
          </template>
        </van-cell>
        <van-cell title="检查更新" is-link @click="checkUpdate" />
      </van-cell-group>

      <van-cell-group inset style="margin-top: 12px">
        <van-cell title="意见反馈" is-link @click="showFeedback" />
        <van-cell title="帮助中心" is-link @click="showHelp" />
      </van-cell-group>

      <div v-if="isLogin" class="logout-section">
        <van-button 
          type="danger" 
          block 
          @click="onLogout"
        >
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLogin = computed(() => userStore.isLogin)

const showNotification = () => {
  showToast('消息通知设置')
}

const showPrivacy = () => {
  showToast('隐私设置')
}

const showGeneral = () => {
  showToast('通用设置')
}

const clearCache = () => {
  showToast('缓存已清除')
}

const checkUpdate = () => {
  showToast('当前已是最新版本')
}

const showFeedback = () => {
  showToast('意见反馈')
}

const showHelp = () => {
  showToast('帮助中心')
}

const onLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？'
    })
    userStore.logout()
    showToast('已退出登录')
    router.push('/profile')
  } catch {
    console.log('取消退出')
  }
}
</script>

<style scoped>
.content {
  padding: 12px;
}

.cache-size {
  color: #969799;
  font-size: 14px;
}

.logout-section {
  margin-top: 24px;
  padding: 0 4px;
}
</style>
