<template>
  <div class="office-page">
    <el-card class="header-card" shadow="never">
      <div class="page-header">
        <div class="header-left">
          <h1>Virtual Office</h1>
          <p>Welcome back, {{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</p>
        </div>
        <div class="header-right">
          <div class="user-status">
            <el-avatar :size="40" class="user-avatar">
              {{ (userStore.userInfo?.nickname || userStore.userInfo?.username)?.charAt(0) }}
            </el-avatar>
            <div class="status-controls">
              <el-select v-model="selectedStatus" size="small" @change="handleStatusChange">
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
              <div class="busy-mode">
                <el-switch v-model="busyMode" size="small" @change="handleBusyModeChange" />
                <span class="busy-label">DND</span>
              </div>
            </div>
          </div>
          <el-dropdown @command="handleCommand">
            <el-button :icon="Setting" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon> Settings
                </el-dropdown-item>
                <el-dropdown-item command="members">
                  <el-icon><User /></el-icon> Members
                </el-dropdown-item>
                <el-dropdown-item command="activities">
                  <el-icon><Clock /></el-icon> Activities
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> Logout
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-card>
    <div class="office-content">
      <div class="main-content">
        <div class="section-header">
          <h2>Rooms</h2>
          <el-tag type="info">{{ roomStore.rooms.length }} rooms available</el-tag>
        </div>
        <div class="rooms-grid">
          <el-card
            v-for="room in roomStore.rooms"
            :key="room.id"
            class="room-card"
            shadow="hover"
          >
            <div class="room-header">
              <div class="room-icon" :class="room.type">
                <el-icon :size="24">
                  <component :is="getRoomIcon(room.type)" />
                </el-icon>
              </div>
              <el-tag size="small" :type="getRoomTagType(room.type)">
                {{ formatRoomType(room.type) }}
              </el-tag>
            </div>
            <h3>{{ room.name }}</h3>
            <p class="room-desc">{{ room.description }}</p>
            <div class="room-footer">
              <div class="room-members">
                <el-avatar-group>
                  <el-avatar
                    v-for="user in (room.users || []).slice(0, 3)"
                    :key="user.id"
                    :size="24"
                  >
                    {{ (user.nickname || user.username)?.charAt(0) }}
                  </el-avatar>
                  <el-avatar v-if="(room.userCount || 0) > 3" :size="24">
                    +{{ (room.userCount || 0) - 3 }}
                  </el-avatar>
                </el-avatar-group>
                <span class="member-count">
                  {{ room.userCount || 0 }}/{{ room.maxCapacity || 10 }}
                </span>
              </div>
              <el-button
                type="primary"
                size="small"
                :disabled="(room.userCount || 0) >= (room.maxCapacity || 10)"
                @click="joinRoom(room.id)"
              >
                Join
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
      <div class="sidebar">
        <el-card class="online-users-card" shadow="never">
          <div class="sidebar-header">
            <h3>Online Users</h3>
            <el-badge :value="onlineUsers.length" class="online-badge" />
          </div>
          <div class="users-list">
            <div
              v-for="user in onlineUsers"
              :key="user.id"
              class="user-item"
            >
              <div class="user-info">
                <el-avatar :size="36">
                  {{ (user.nickname || user.username)?.charAt(0) }}
                </el-avatar>
                <div class="user-details">
                  <span class="user-name">{{ user.nickname || user.username }}</span>
                  <span class="user-status" :class="user.status">
                    {{ user.status }}
                  </span>
                </div>
              </div>
              <div class="user-actions">
                <el-button
                  :icon="Phone"
                  circle
                  size="small"
                  type="success"
                  @click="callUser(user, 'voice')"
                />
                <el-button
                  :icon="ChatDotRound"
                  circle
                  size="small"
                  type="primary"
                  @click="sendMessage(user)"
                />
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Setting,
  User,
  Clock,
  SwitchButton,
  Phone,
  ChatDotRound,
  OfficeBuilding,
  Briefcase,
  CoffeeCup,
  Lock
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useRoomStore } from '@/stores/room'
import { useWsStore } from '@/stores/ws'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const roomStore = useRoomStore()
const wsStore = useWsStore()

const selectedStatus = ref('online')
const busyMode = ref(false)
const allUsers = ref([])

const onlineUsers = computed(() => {
  return allUsers.value.filter(u => u.status !== 'offline')
})

const roomIcons = {
  open_office: OfficeBuilding,
  meeting: Briefcase,
  lounge: CoffeeCup,
  private: Lock
}

function getRoomIcon(type) {
  return roomIcons[type] || OfficeBuilding
}

function getRoomTagType(type) {
  const types = {
    open_office: 'success',
    meeting: 'primary',
    lounge: 'warning',
    private: 'info'
  }
  return types[type] || 'info'
}

function formatRoomType(type) {
  const types = {
    open_office: 'Open Office',
    meeting: 'Meeting',
    lounge: 'Lounge',
    private: 'Private'
  }
  return types[type] || type
}

async function handleStatusChange(status) {
  try {
    await userStore.updateStatus(status)
    wsStore.sendStatusUpdate(status)
    ElMessage.success('Status updated')
  } catch (e) {
    ElMessage.error('Failed to update status')
  }
}

async function handleBusyModeChange(val) {
  try {
    await userStore.setBusyMode(val ? 1 : 0)
    ElMessage.success(val ? 'Do Not Disturb enabled' : 'Do Not Disturb disabled')
  } catch (e) {
    ElMessage.error('Failed to update busy mode')
  }
}

function handleCommand(command) {
  switch (command) {
    case 'settings':
      router.push('/settings')
      break
    case 'members':
      router.push('/members')
      break
    case 'activities':
      router.push('/activities')
      break
    case 'logout':
      handleLogout()
      break
  }
}

async function handleLogout() {
  wsStore.disconnect()
  await userStore.logout()
  router.push('/login')
}

async function joinRoom(roomId) {
  try {
    await roomStore.joinRoom(roomId)
    router.push(`/room/${roomId}`)
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to join room')
  }
}

function callUser(user, type) {
  wsStore.startCall(user.id, type)
  ElMessage.info(`Starting ${type} call with ${user.nickname || user.username}`)
}

function sendMessage(user) {
  ElMessage.info(`Opening chat with ${user.nickname || user.username}`)
}

async function fetchOnlineUsers() {
  try {
    const response = await request.get('/api/user/list')
    allUsers.value = response.data || []
  } catch (e) {
    console.error('Failed to fetch online users')
  }
}

onMounted(async () => {
  await Promise.all([
    roomStore.fetchRooms(),
    fetchOnlineUsers()
  ])
  if (userStore.userInfo?.status) {
    selectedStatus.value = userStore.userInfo.status
  }
})
</script>

<style lang="scss" scoped>
.office-page {
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
        h1 {
          margin: 0 0 4px 0;
          color: #303133;
          font-size: 24px;
          font-weight: 600;
        }

        p {
          margin: 0;
          color: #909399;
          font-size: 14px;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;

        .user-status {
          display: flex;
          align-items: center;
          gap: 12px;

          .user-avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            font-weight: 500;
          }

          .status-controls {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .busy-mode {
              display: flex;
              align-items: center;
              gap: 6px;

              .busy-label {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }
    }
  }

  .office-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;

    .main-content {
      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        h2 {
          margin: 0;
          color: #303133;
          font-size: 18px;
          font-weight: 600;
        }
      }

      .rooms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;

        .room-card {
          border-radius: 12px;
          transition: all 0.3s;
          cursor: pointer;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          }

          .room-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .room-icon {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;

              &.open_office {
                background: rgba(103, 194, 58, 0.1);
                color: #67c23a;
              }

              &.meeting {
                background: rgba(64, 158, 255, 0.1);
                color: #409eff;
              }

              &.lounge {
                background: rgba(230, 162, 60, 0.1);
                color: #e6a23c;
              }

              &.private {
                background: rgba(144, 147, 153, 0.1);
                color: #909399;
              }
            }
          }

          h3 {
            margin: 0 0 8px 0;
            color: #303133;
            font-size: 16px;
            font-weight: 600;
          }

          .room-desc {
            margin: 0 0 16px 0;
            color: #909399;
            font-size: 13px;
            line-height: 1.5;
            min-height: 36px;
          }

          .room-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .room-members {
              display: flex;
              align-items: center;
              gap: 8px;

              .member-count {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }
    }

    .sidebar {
      .online-users-card {
        border-radius: 12px;
        height: fit-content;
        position: sticky;
        top: 20px;

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h3 {
            margin: 0;
            color: #303133;
            font-size: 16px;
            font-weight: 600;
          }

          .online-badge {
            :deep(.el-badge__content) {
              background: #67c23a;
            }
          }
        }

        .users-list {
          .user-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f5f7fa;

            &:last-child {
              border-bottom: none;
            }

            .user-info {
              display: flex;
              align-items: center;
              gap: 12px;

              .user-details {
                display: flex;
                flex-direction: column;

                .user-name {
                  font-weight: 500;
                  color: #303133;
                  font-size: 14px;
                }

                .user-status {
                  font-size: 12px;
                  text-transform: capitalize;

                  &.online {
                    color: #67c23a;
                  }

                  &.busy {
                    color: #e6a23c;
                  }

                  &.away {
                    color: #f56c6c;
                  }

                  &.offline {
                    color: #909399;
                  }
                }
              }
            }

            .user-actions {
              display: flex;
              gap: 8px;
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
