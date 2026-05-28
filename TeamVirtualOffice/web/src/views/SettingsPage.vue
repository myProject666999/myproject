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
            <el-select v-model="statusForm.status" size="large" style="width: 200px">
              <el-option label="Online" value="online">
                <span class="status-option">
                  <span class="status-dot online"></span> Online
                </span>
              </el-option>
              <el-option label="Busy" value="busy">
                <span class="status-option">
                  <span class="status-dot busy"></span> Busy
                </span>
              </el-option>
              <el-option label="Away" value="away">
                <span class="status-option">
                  <span class="status-dot away"></span> Away
                </span>
              </el-option>
              <el-option label="Offline" value="offline">
                <span class="status-option">
                  <span class="status-dot offline"></span> Offline
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Busy Mode">
            <div class="switch-row">
              <el-switch v-model="statusForm.busyMode" size="large" />
              <span class="switch-label">
                Do Not Disturb - Mutes all notifications
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
          <el-icon :size="24" color="#67c23a"><Bell /></el-icon>
          <h2>Notification Settings</h2>
        </div>
        <el-form :model="notificationSettings" label-width="180px" class="settings-form">
          <el-form-item label="Desktop Notifications">
            <div class="switch-row">
              <el-switch v-model="notificationSettings.desktop" size="large" />
              <span class="switch-label">
                Receive desktop notifications for messages and calls
              </span>
            </div>
          </el-form-item>
          <el-form-item label="Sound Notifications">
            <div class="switch-row">
              <el-switch v-model="notificationSettings.sound" size="large" />
              <span class="switch-label">
                Play sound for incoming messages and calls
              </span>
            </div>
          </el-form-item>
          <el-form-item label="Message Notifications">
            <div class="switch-row">
              <el-switch v-model="notificationSettings.messages" size="large" />
              <span class="switch-label">
                Receive notifications for new messages
              </span>
            </div>
          </el-form-item>
          <el-form-item label="Call Notifications">
            <div class="switch-row">
              <el-switch v-model="notificationSettings.calls" size="large" />
              <span class="switch-label">
                Receive notifications for incoming calls
              </span>
            </div>
          </el-form-item>
          <el-form-item label="Activity Notifications">
            <div class="switch-row">
              <el-switch v-model="notificationSettings.activity" size="large" />
              <span class="switch-label">
                Receive notifications for team activities
              </span>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="savingNotifications"
              @click="saveNotificationSettings"
            >
              Save Settings
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
              {{ (userStore.userInfo?.nickname || userStore.userInfo?.username)?.charAt(0) }}
            </el-avatar>
            <div class="avatar-info">
              <h3>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h3>
              <p class="username">@{{ userStore.userInfo?.username }}</p>
              <el-button type="primary" size="small">
                Change Avatar
              </el-button>
            </div>
          </div>
          <el-divider />
          <el-form :model="accountForm" label-width="140px" class="settings-form">
            <el-form-item label="Username">
              <el-input
                v-model="accountForm.username"
                disabled
                size="large"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item label="Nickname">
              <el-input
                v-model="accountForm.nickname"
                size="large"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item label="Email">
              <el-input
                v-model="accountForm.email"
                size="large"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="savingAccount"
                @click="saveAccountInfo"
              >
                Save Account
              </el-button>
              <el-button
                type="danger"
                size="large"
                style="margin-left: 12px"
                @click="showPasswordDialog = true"
              >
                Change Password
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
    <el-dialog
      v-model="showPasswordDialog"
      title="Change Password"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="120px"
      >
        <el-form-item label="Current Password" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="New Password" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="changingPassword" @click="changePassword">
          Update Password
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  User,
  Bell,
  UserFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useWsStore } from '@/stores/ws'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const wsStore = useWsStore()

const saving = ref(false)
const savingNotifications = ref(false)
const savingAccount = ref(false)
const changingPassword = ref(false)
const showPasswordDialog = ref(false)
const passwordFormRef = ref(null)

const statusForm = reactive({
  status: 'online',
  busyMode: false,
  textStatus: ''
})

const notificationSettings = reactive({
  desktop: true,
  sound: true,
  messages: true,
  calls: true,
  activity: false
})

const accountForm = reactive({
  username: '',
  nickname: '',
  email: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [
    { required: true, message: 'Please enter current password', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'Please enter new password', trigger: 'blur' },
    { min: 6, message: 'Password should be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm new password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function goBack() {
  router.push('/office')
}

async function saveStatus() {
  saving.value = true
  try {
    await Promise.all([
      userStore.updateStatus(statusForm.status),
      request.put('/api/user/busy-mode', { busyMode: statusForm.busyMode }),
      request.put('/api/user/text-status', { textStatus: statusForm.textStatus })
    ])
    wsStore.sendStatusUpdate(statusForm.status)
    ElMessage.success('Status updated successfully')
  } catch (e) {
    ElMessage.error('Failed to update status')
  } finally {
    saving.value = false
  }
}

async function saveNotificationSettings() {
  savingNotifications.value = true
  try {
    await request.put('/api/user/notification-settings', notificationSettings)
    ElMessage.success('Notification settings saved')
  } catch (e) {
    ElMessage.error('Failed to save settings')
  } finally {
    savingNotifications.value = false
  }
}

async function saveAccountInfo() {
  savingAccount.value = true
  try {
    await request.put('/api/user/info', {
      nickname: accountForm.nickname,
      email: accountForm.email
    })
    await userStore.fetchUserInfo()
    ElMessage.success('Account information updated')
  } catch (e) {
    ElMessage.error('Failed to update account info')
  } finally {
    savingAccount.value = false
  }
}

async function changePassword() {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      changingPassword.value = true
      try {
        await request.put('/api/user/password', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('Password changed successfully')
        showPasswordDialog.value = false
        passwordFormRef.value?.resetFields()
      } catch (e) {
        ElMessage.error(e.response?.data?.message || 'Failed to change password')
      } finally {
        changingPassword.value = false
      }
    }
  })
}

onMounted(() => {
  if (userStore.userInfo) {
    statusForm.status = userStore.userInfo.status || 'online'
    statusForm.busyMode = userStore.userInfo.busyMode || false
    statusForm.textStatus = userStore.userInfo.textStatus || ''
    accountForm.username = userStore.userInfo.username || ''
    accountForm.nickname = userStore.userInfo.nickname || ''
    accountForm.email = userStore.userInfo.email || ''
  }
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
          h1 {
            margin: 0 0 4px 0;
            color: #303133;
            font-size: 20px;
            font-weight: 600;
          }

          p {
            margin: 0;
            color: #909399;
            font-size: 14px;
          }
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

        h2 {
          margin: 0;
          color: #303133;
          font-size: 18px;
          font-weight: 600;
        }
      }

      .settings-form {
        .switch-row {
          display: flex;
          align-items: center;
          gap: 12px;

          .switch-label {
            color: #606266;
            font-size: 14px;
          }
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
            h3 {
              margin: 0 0 4px 0;
              color: #303133;
              font-size: 20px;
              font-weight: 600;
            }

            .username {
              margin: 0 0 12px 0;
              color: #909399;
              font-size: 14px;
            }
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

    &.online {
      background: #67c23a;
    }

    &.busy {
      background: #e6a23c;
    }

    &.away {
      background: #f56c6c;
    }

    &.offline {
      background: #909399;
    }
  }
}
</style>
