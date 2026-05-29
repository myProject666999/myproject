<template>
  <div class="settings-page">
    <el-card class="header-card" shadow="never">
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" circle @click="goBack" />
          <div class="header-info">
            <h1>Settings</h1>
            <p>Manage your personal status and preferences</p>
          </div>
        </div>
      </div>
    </el-card>
    <div class="settings-content">
      <el-card class="settings-card" shadow="never">
        <div class="section-header">
          <el-icon :size="24" color="#409eff"><User /></el-icon>
          <h2>Personal Status</h2>
        </div>
        <el-form :model="statusForm" label-width="140px" class="settings-form">
          <el-form-item label="Online Status">
            <el-select v-model="statusForm.onlineStatus" size="large" style="width: 200px">
              <el-option label="Online" :value="1">
                <span class="status-option"><span class="status-dot online"></span> Online</span>
              </el-option>
              <el-option label="Busy" :value="2">
                <span class="status-option"><span class="status-dot busy"></span> Busy</span>
              </el-option>
              <el-option label="Away" :value="3">
                <span class="status-option"><span class="status-dot away"></span> Away</span>
              </el-option>
              <el-option label="Offline" :value="0">
                <span class="status-option"><span class="status-dot offline"></span> Offline</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Busy Mode">
            <div class="switch-row">
              <el-switch v-model="statusForm.busyMode" size="large" />
              <span class="switch-label">
                Do Not Disturb - Mutes all notifications and blocks calls
              </span>
            </div>
          </el-form-item>
          <el-form-item label="Text Status">
            <el-input
              v-model="statusForm.textStatus"
              placeholder="What's on your mind?"
              maxlength="100"
              show-word-limit
              size="large"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="saving"
              @click="saveStatus"
            >
              Save Status
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="settings-card" shadow="never">
        <div class="section-header">
          <el-icon :size="24" color="#e6a23c"><UserFilled /></el-icon>
          <h2>Account Information</h2>
        </div>
        <div class="account-info">
          <div class="avatar-section">
            <el-avatar :size="80" class="account-avatar">
              {{ (userStore.userInfo?.nickname || userStore.userInfo?.username || 'U')?.charAt(0) }}
            </el-avatar>
            <div class="avatar-info">
              <h3>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h3>
              <p class="username">@{{ userStore.userInfo?.username }}</p>
            </div>
          </div>
          <el-divider />
          <el-form :model="accountForm" label-width="140px" class="settings-form">
            <el-form-item label="Username">
              <el-input v-model="accountForm.username" disabled size="large" style="width: 300px" />
            </el-form-item>
            <el-form-item label="Nickname">
              <el-input v-model="accountForm.nickname" size="large" style="width: 300px" />
            </el-form-item>
            <el-form-item label="Email">
              <el-input v-model="accountForm.email" size="large" style="width: 300px" />
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

const saving = ref(false)

const statusForm = reactive({
  onlineStatus: 1,
  busyMode: false,
  textStatus: ''
})

const accountForm = reactive({
  username: '',
  nickname: '',
  email: ''
})

function goBack() {
  router.push('/office')
}

async function saveStatus() {
  saving.value = true
  try {
    await request.post('/api/status/update', {
      online_status: statusForm.onlineStatus,
      busy_mode: statusForm.busyMode ? 1 : 0,
      text_status: statusForm.textStatus
    })
    ElMessage.success('Status updated successfully')
    await userStore.fetchUserInfo()
  } catch (e) {
    ElMessage.error('Failed to update status')
  } finally {
    saving.value = false
  }
}

async function fetchCurrentStatus() {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) return
    const response = await request.get(`/api/status/${userId}`)
    const data = response.data
    if (data) {
      statusForm.onlineStatus = data.online_status ?? 1
      statusForm.busyMode = data.busy_mode === 1
      statusForm.textStatus = data.text_status || ''
    }
  } catch (e) {
    console.error('Failed to fetch current status')
  }
}

onMounted(async () => {
  if (userStore.userInfo) {
    accountForm.username = userStore.userInfo.username || ''
    accountForm.nickname = userStore.userInfo.nickname || ''
    accountForm.email = userStore.userInfo.email || ''
  }
  await fetchCurrentStatus()
})
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;

  .header-card {
    margin-bottom: 20px;
    border-radius: 12px;
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
        .header-info {
          h1 { margin: 0 0 4px 0; color: #303133; font-size: 20px; font-weight: 600; }
          p { margin: 0; color: #909399; font-size: 14px; }
        }
      }
    }
  }

  .settings-content {
    max-width: 800px;

    .settings-card {
      margin-bottom: 20px;
      border-radius: 12px;

      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f2f5;
        h2 { margin: 0; color: #303133; font-size: 18px; font-weight: 600; }
      }

      .settings-form {
        .switch-row {
          display: flex;
          align-items: center;
          gap: 12px;
          .switch-label { color: #606266; font-size: 14px; }
        }
      }

      .account-info {
        .avatar-section {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 16px;
          .account-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            font-size: 32px;
            font-weight: 500;
          }
          .avatar-info {
            h3 { margin: 0 0 4px 0; color: #303133; font-size: 20px; font-weight: 600; }
            .username { margin: 0; color: #909399; font-size: 14px; }
          }
        }
      }
    }
  }
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    &.online { background: #67c23a; }
    &.busy { background: #e6a23c; }
    &.away { background: #f56c6c; }
    &.offline { background: #909399; }
  }
}
</style>
