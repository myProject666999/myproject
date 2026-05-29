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
                <el-option label="Online" :value="1">
                  <span class="status-option">
                    <span class="status-dot online"></span> Online
                  </span>
                </el-option>
                <el-option label="Busy" :value="2">
                  <span class="status-option">
                    <span class="status-dot busy"></span> Busy
                  </span>
                </el-option>
                <el-option label="Away" :value="3">
                  <span class="status-option">
                    <span class="status-dot away"></span> Away
                  </span>
                </el-option>
                <el-option label="Offline" :value="0">
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
              <div class="room-icon" :class="getRoomTypeClass(room.type)">
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
                <span class="member-count">
                  {{ room.member_count || 0 }}/{{ room.max_capacity || 10 }}
                </span>
              </div>
              <el-button
                type="primary"
                size="small"
                :disabled="(room.member_count || 0) >= (room.max_capacity || 10)"
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
                  <span class="user-status" :class="getStatusClass(user.online_status)">
                    {{ getStatusLabel(user.online_status) }}
                  </span>
                </div>
              </div>
              <div class="user-actions">
                <el-button
                  :icon="Phone"
                  circle
                  size="small"
                  type="success"
                  :disabled="user.online_status === 0 || user.id === currentUserId"
                  @click="callUser(user, 1)"
                />
                <el-button
                  :icon="VideoCamera"
                  circle
                  size="small"
                  type="primary"
                  :disabled="user.online_status === 0 || user.id === currentUserId"
                  @click="callUser(user, 2)"
                />
                <el-button
                  :icon="ChatDotRound"
                  circle
                  size="small"
                  type="warning"
                  @click="sendMessage(user)"
                />
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <el-dialog v-model="chatDialogVisible" :title="`Chat with ${chatTarget?.nickname || chatTarget?.username || ''}`" width="500px">
      <div class="chat-dialog-messages" ref="chatMessagesRef">
        <div
          v-for="msg in chatMessages"
          :key="msg.id"
          class="chat-msg-item"
          :class="{ own: msg.sender_id === currentUserId }"
        >
          <div class="chat-msg-bubble" :class="{ own: msg.sender_id === currentUserId }">
            {{ msg.content }}
          </div>
          <div class="chat-msg-time">{{ formatTime(msg.created_at) }}</div>
        </div>
        <div v-if="chatMessages.length === 0" class="no-chat-messages">
          <p>No messages yet. Start a conversation!</p>
        </div>
      </div>
      <div class="chat-dialog-input">
        <el-input
          v-model="chatInput"
          placeholder="Type a message..."
          @keyup.enter="sendPrivateMessage"
        >
          <template #append>
            <el-button type="primary" :disabled="!chatInput.trim()" @click="sendPrivateMessage">
              Send
            </el-button>
          </template>
        </el-input>
      </div>
    </el-dialog>

    <el-dialog v-model="callDialogVisible" :title="callType === 1 ? 'Voice Call' : 'Video Call'" width="400px" :close-on-click-modal="false">
      <div class="call-dialog-content">
        <el-avatar :size="80" class="call-avatar">
          {{ (callTarget?.nickname || 'U')?.charAt(0) }}
        </el-avatar>
        <h3>{{ callTarget?.nickname || callTarget?.username }}</h3>
        <p v-if="callState === 'calling'" class="call-status">Calling...</p>
        <p v-else-if="callState === 'connected'" class="call-status connected">Connected</p>
        <p v-else-if="callState === 'rejected'" class="call-status rejected">Rejected</p>
        <p v-else-if="callState === 'dnd'" class="call-status rejected">Do Not Disturb</p>
      </div>
      <template #footer>
        <el-button type="danger" size="large" @click="hangupCall" :disabled="callState === 'rejected' || callState === 'dnd'">
          Hang Up
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Setting,
  User,
  Clock,
  SwitchButton,
  Phone,
  VideoCamera,
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

const selectedStatus = ref(1)
const busyMode = ref(false)
const allUsers = ref([])

const chatDialogVisible = ref(false)
const chatTarget = ref(null)
const chatMessages = ref([])
const chatInput = ref('')
const chatMessagesRef = ref(null)

const callDialogVisible = ref(false)
const callTarget = ref(null)
const callType = ref(1)
const callState = ref('idle')
const currentCallId = ref(null)

const currentUserId = computed(() => userStore.userInfo?.id)

const onlineUsers = computed(() => {
  return allUsers.value.filter(u => u.online_status !== 0)
})

function getStatusClass(status) {
  const map = { 1: 'online', 2: 'busy', 3: 'away', 0: 'offline' }
  return map[status] || 'offline'
}

function getStatusLabel(status) {
  const map = { 1: 'Online', 2: 'Busy', 3: 'Away', 0: 'Offline' }
  return map[status] || 'Offline'
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const roomIcons = {
  1: OfficeBuilding,
  2: Briefcase,
  3: CoffeeCup,
  4: Lock
}

function getRoomIcon(type) {
  return roomIcons[type] || OfficeBuilding
}

function getRoomTypeClass(type) {
  const map = { 1: 'open_office', 2: 'meeting', 3: 'lounge', 4: 'private' }
  return map[type] || 'open_office'
}

function getRoomTagType(type) {
  const types = { 1: 'success', 2: 'primary', 3: 'warning', 4: 'info' }
  return types[type] || 'info'
}

function formatRoomType(type) {
  const types = { 1: 'Open Office', 2: 'Meeting', 3: 'Lounge', 4: 'Private' }
  return types[type] || 'Room'
}

async function handleStatusChange(status) {
  try {
    await userStore.updateStatus(status, busyMode.value ? 1 : 0, '')
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
    ElMessage.error(e?.response?.data?.message || e?.message || 'Failed to join room')
  }
}

async function callUser(user, type) {
  callTarget.value = user
  callType.value = type
  callState.value = 'calling'
  callDialogVisible.value = true

  try {
    const response = await request.post('/api/call/start', {
      callee_id: user.id,
      type: type
    })
    currentCallId.value = response.data?.call_id
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Failed to start call'
    if (msg.includes('DND') || msg.includes('dnd') || msg.includes('DND mode')) {
      callState.value = 'dnd'
    } else {
      callState.value = 'rejected'
      ElMessage.error(msg)
    }
  }
}

async function hangupCall() {
  if (currentCallId.value) {
    try {
      await request.post(`/api/call/hangup/${currentCallId.value}`)
    } catch {}
  }
  callDialogVisible.value = false
  callState.value = 'idle'
  currentCallId.value = null
  callTarget.value = null
}

async function sendMessage(user) {
  chatTarget.value = user
  chatDialogVisible.value = true
  chatMessages.value = []
  chatInput.value = ''
  await fetchPrivateMessages(user.id)
}

async function fetchPrivateMessages(userId) {
  try {
    const response = await request.get(`/api/message/private/${userId}`, {
      params: { page: 1, page_size: 50 }
    })
    const list = response.data?.list || response.data || []
    chatMessages.value = list.reverse()
    scrollChatToBottom()
  } catch (e) {
    console.error('Failed to fetch messages')
  }
}

async function sendPrivateMessage() {
  if (!chatInput.value.trim() || !chatTarget.value) return
  try {
    await request.post('/api/message/private', {
      receiver_id: chatTarget.value.id,
      content: chatInput.value,
      type: 1
    })
    chatInput.value = ''
    await fetchPrivateMessages(chatTarget.value.id)
  } catch (e) {
    ElMessage.error('Failed to send message')
  }
}

function scrollChatToBottom() {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

async function fetchOnlineUsers() {
  try {
    const response = await request.get('/api/user/list')
    allUsers.value = response.data || []
  } catch (e) {
    console.error('Failed to fetch online users')
  }
}

watch(() => wsStore.messages, (newMessages) => {
  const latest = newMessages[newMessages.length - 1]
  if (!latest) return

  if (latest.type === 'call_answered' && currentCallId.value === latest.call_id) {
    callState.value = 'connected'
  }
  if (latest.type === 'call_rejected' && currentCallId.value === latest.call_id) {
    callState.value = 'rejected'
  }
  if (latest.type === 'call_ended' && currentCallId.value === latest.call_id) {
    callDialogVisible.value = false
    callState.value = 'idle'
    currentCallId.value = null
    callTarget.value = null
  }
  if (latest.type === 'private_message' && chatDialogVisible.value && chatTarget.value) {
    if (latest.sender_id === chatTarget.value.id || latest.sender_id === currentUserId.value) {
      chatMessages.value.push({
        id: Date.now(),
        sender_id: latest.sender_id,
        content: latest.content,
        created_at: latest.created_at || new Date().toISOString()
      })
      scrollChatToBottom()
    }
  }
  if (latest.type === 'call_incoming') {
    ElMessage.info(`Incoming ${latest.call_type === 2 ? 'video' : 'voice'} call from ${latest.nickname}`)
  }
  if (latest.type === 'status_update') {
    fetchOnlineUsers()
  }
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    roomStore.fetchRooms(),
    fetchOnlineUsers()
  ])
  const userStatus = userStore.userInfo?.user_status
  if (userStatus) {
    selectedStatus.value = userStatus.online_status ?? 1
    busyMode.value = userStatus.busy_mode === 1
  }
})

onUnmounted(() => {})
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

.chat-dialog-messages {
  height: 350px;
  overflow-y: auto;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 12px;

  .chat-msg-item {
    margin-bottom: 12px;
    &.own { text-align: right; }

    .chat-msg-bubble {
      display: inline-block;
      padding: 8px 14px;
      border-radius: 12px 12px 12px 4px;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      max-width: 70%;
      word-break: break-word;
      font-size: 14px;
      color: #303133;

      &.own {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: #fff;
        border-radius: 12px 12px 4px 12px;
      }
    }

    .chat-msg-time {
      font-size: 11px;
      color: #c0c4cc;
      margin-top: 4px;
    }
  }

  .no-chat-messages {
    text-align: center;
    padding: 40px;
    color: #909399;
    p { margin: 0; }
  }
}

.chat-dialog-input {
  :deep(.el-input__wrapper) { border-radius: 20px; }
}

.call-dialog-content {
  text-align: center;
  padding: 20px 0;

  .call-avatar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-size: 32px;
    margin-bottom: 16px;
  }

  h3 { margin: 0 0 8px 0; color: #303133; }

  .call-status {
    color: #909399;
    font-size: 14px;
    margin: 0;

    &.connected { color: #67c23a; }
    &.rejected { color: #f56c6c; }
  }
}
</style>
