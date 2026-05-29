<template>
  <div class="room-page">
    <el-card class="header-card" shadow="never">
      <div class="room-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" circle @click="goBack" />
          <div class="room-info">
            <h1>{{ roomDetail?.name || 'Room' }}</h1>
            <p>{{ roomDetail?.description || '' }}</p>
          </div>
        </div>
        <div class="header-right">
          <el-tag type="success" v-if="mySeatInfo">
            Seat {{ mySeatInfo.seat_number }}
          </el-tag>
          <el-button type="danger" @click="leaveRoom">
            <el-icon><SwitchButton /></el-icon>
            Leave Room
          </el-button>
        </div>
      </div>
    </el-card>
    <div class="room-content">
      <div class="main-section">
        <el-card class="seats-card" shadow="never">
          <div class="section-title">
            <h3>Seats</h3>
            <span>{{ occupiedCount }}/{{ seats.length }} occupied</span>
          </div>
          <div class="seats-grid">
            <div
              v-for="seat in seats"
              :key="seat.id"
              class="seat-item"
              :class="{
                occupied: seat.is_occupied,
                mine: seat.user_id === currentUserId,
                empty: !seat.is_occupied
              }"
              @click="handleSeatClick(seat)"
            >
              <div class="seat-content">
                <div v-if="seat.is_occupied" class="occupied-seat">
                  <el-avatar :size="32" class="seat-avatar">
                    {{ (seat.nickname || 'U')?.charAt(0) }}
                  </el-avatar>
                  <span class="seat-user">
                    {{ seat.nickname || 'Unknown' }}
                  </span>
                </div>
                <div v-else class="empty-seat">
                  <el-icon :size="24" color="#c0c4cc"><Box /></el-icon>
                </div>
              </div>
              <div class="seat-number">{{ seat.seat_number }}</div>
              <div class="seat-position">({{ seat.pos_x }}, {{ seat.pos_y }})</div>
            </div>
          </div>
          <div v-if="seats.length === 0" class="no-seats">
            <p>No seats in this room</p>
          </div>
        </el-card>
        <el-card class="chat-card" shadow="never">
          <div class="section-title">
            <h3>Room Chat</h3>
          </div>
          <div class="chat-messages" ref="messagesContainer">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-item"
              :class="{ own: msg.sender_id === currentUserId }"
            >
              <el-avatar v-if="msg.sender_id !== currentUserId" :size="32" class="msg-avatar">
                {{ (msg.nickname || 'U')?.charAt(0) }}
              </el-avatar>
              <div class="msg-content">
                <div v-if="msg.sender_id !== currentUserId" class="msg-sender">
                  {{ msg.nickname || 'Unknown' }}
                </div>
                <div class="msg-bubble">
                  {{ msg.content }}
                </div>
                <div class="msg-time">
                  {{ formatTime(msg.created_at) }}
                </div>
              </div>
            </div>
            <div v-if="messages.length === 0" class="no-messages">
              <el-icon :size="48" color="#c0c4cc"><ChatDotRound /></el-icon>
              <p>No messages yet</p>
            </div>
          </div>
          <div class="chat-input-area">
            <el-input
              v-model="messageInput"
              placeholder="Type a message..."
              @keyup.enter="sendMessage"
            >
              <template #append>
                <el-button type="primary" :disabled="!messageInput.trim()" @click="sendMessage">
                  <el-icon><Promotion /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </el-card>
      </div>
      <div class="sidebar">
        <el-card class="members-card" shadow="never">
          <div class="sidebar-header">
            <h3>Members</h3>
            <el-badge :value="members.length" class="member-badge" />
          </div>
          <div class="members-list">
            <div
              v-for="member in members"
              :key="member.id"
              class="member-item"
            >
              <div class="member-info">
                <div class="avatar-wrapper">
                  <el-avatar :size="40">
                    {{ (member.nickname || 'U')?.charAt(0) }}
                  </el-avatar>
                  <span class="status-indicator" :class="getStatusClass(member.online_status)"></span>
                </div>
                <div class="member-details">
                  <span class="member-name">{{ member.nickname || 'Unknown' }}</span>
                  <span class="member-status" :class="getStatusClass(member.online_status)">
                    {{ getStatusLabel(member.online_status) }}
                  </span>
                </div>
              </div>
              <div class="member-actions">
                <el-button
                  :icon="Phone"
                  circle
                  size="small"
                  type="success"
                  @click="callUser(member, 'voice')"
                />
                <el-button
                  :icon="VideoCamera"
                  circle
                  size="small"
                  type="primary"
                  @click="callUser(member, 'video')"
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  SwitchButton,
  Box,
  ChatDotRound,
  Promotion,
  Phone,
  VideoCamera
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useWsStore } from '@/stores/ws'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const wsStore = useWsStore()

const roomId = ref(route.params.id)
const messageInput = ref('')
const messages = ref([])
const messagesContainer = ref(null)
const roomDetail = ref(null)
const seats = ref([])
const members = ref([])

const currentUserId = computed(() => userStore.userInfo?.id)

const occupiedCount = computed(() => {
  return seats.value.filter(s => s.is_occupied).length
})

const mySeatInfo = computed(() => {
  return seats.value.find(s => s.user_id === currentUserId.value)
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

function goBack() {
  router.push('/office')
}

async function fetchRoomDetail() {
  try {
    const response = await request.get(`/api/room/${roomId.value}`)
    roomDetail.value = response.data
    seats.value = response.data?.seats || []
    members.value = response.data?.members || []
  } catch (e) {
    ElMessage.error('Failed to load room')
  }
}

async function fetchMessages() {
  try {
    const response = await request.get(`/api/message/room/${roomId.value}`, {
      params: { page: 1, page_size: 50 }
    })
    const list = response.data?.list || response.data || []
    messages.value = list.reverse()
    scrollToBottom()
  } catch (e) {
    console.error('Failed to fetch messages')
  }
}

async function leaveRoom() {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to leave this room?',
      'Leave Room',
      { confirmButtonText: 'Leave', cancelButtonText: 'Cancel', type: 'warning' }
    )
    await request.post(`/api/room/leave/${roomId.value}`)
    ElMessage.success('Left room')
    router.push('/office')
  } catch {}
}

async function handleSeatClick(seat) {
  if (seat.user_id === currentUserId.value) {
    try {
      await ElMessageBox.confirm(
        'Are you sure you want to leave this seat?',
        'Leave Seat',
        { confirmButtonText: 'Leave', cancelButtonText: 'Cancel', type: 'warning' }
      )
      await request.post(`/api/seat/leave/${seat.id}`)
      ElMessage.success('You left the seat')
      await fetchRoomDetail()
    } catch {}
  } else if (!seat.is_occupied) {
    try {
      await request.post(`/api/seat/occupy/${seat.id}`)
      ElMessage.success(`You took seat ${seat.seat_number}`)
      await fetchRoomDetail()
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to take seat'
      ElMessage.error(msg)
    }
  } else {
    ElMessage.info('This seat is occupied')
  }
}

async function sendMessage() {
  if (!messageInput.value.trim()) return
  try {
    await request.post('/api/message/room', {
      room_id: parseInt(roomId.value),
      content: messageInput.value,
      type: 1
    })
    messageInput.value = ''
    await fetchMessages()
  } catch (e) {
    ElMessage.error('Failed to send message')
  }
}

async function callUser(member, type) {
  try {
    const callType = type === 'video' ? 2 : 1
    const response = await request.post('/api/call/start', {
      callee_id: member.id,
      type: callType
    })
    ElMessage.success(`Calling ${member.nickname || 'user'}...`)
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Failed to start call'
    ElMessage.error(msg)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => wsStore.messages, (newMessages) => {
  const latest = newMessages[newMessages.length - 1]
  if (latest && latest.type === 'room_message' && latest.room_id == roomId.value) {
    messages.value.push({
      id: Date.now(),
      sender_id: latest.sender_id,
      nickname: latest.nickname,
      content: latest.content,
      created_at: latest.created_at || new Date().toISOString()
    })
    scrollToBottom()
  }
  if (latest && (latest.type === 'user_joined' || latest.type === 'user_left' || latest.type === 'seat_occupied' || latest.type === 'seat_left')) {
    fetchRoomDetail()
  }
}, { deep: true })

onMounted(async () => {
  await fetchRoomDetail()
  await fetchMessages()
})

onUnmounted(() => {})
</script>

<style lang="scss" scoped>
.room-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;

  .header-card {
    margin-bottom: 20px;
    border-radius: 12px;

    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .room-info {
          h1 { margin: 0 0 4px 0; color: #303133; font-size: 20px; font-weight: 600; }
          p { margin: 0; color: #909399; font-size: 14px; }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }

  .room-content {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 20px;

    .main-section {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .seats-card {
        border-radius: 12px;

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          h3 { margin: 0; color: #303133; font-size: 16px; font-weight: 600; }
          span { color: #909399; font-size: 14px; }
        }

        .seats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;

          .seat-item {
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;

            &.empty {
              background: #f5f7fa;
              border: 2px dashed #dcdfe6;
              &:hover { border-color: #409eff; background: #ecf5ff; }
            }

            &.occupied {
              background: #f5f7fa;
              border: 2px solid #dcdfe6;
              &:hover { border-color: #e6a23c; }
            }

            &.mine {
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
              border: 2px solid #667eea;
              &:hover { border-color: #764ba2; }
            }

            .seat-content {
              margin-bottom: 8px;
              min-height: 50px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              .occupied-seat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                .seat-avatar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
                .seat-user { font-size: 12px; color: #303133; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
              }
            }

            .seat-number { font-size: 11px; color: #909399; font-weight: 600; }
            .seat-position { font-size: 10px; color: #c0c4cc; }
          }
        }

        .no-seats {
          text-align: center;
          padding: 40px;
          color: #909399;
        }
      }

      .chat-card {
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        min-height: 400px;

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          h3 { margin: 0; color: #303133; font-size: 16px; font-weight: 600; }
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
          margin-bottom: 16px;
          min-height: 300px;
          max-height: 400px;

          .no-messages {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #c0c4cc;
            p { margin: 12px 0 0 0; font-size: 14px; }
          }

          .message-item {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;

            &.own {
              flex-direction: row-reverse;
              .msg-content {
                align-items: flex-end;
                .msg-bubble {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #fff;
                  border-radius: 16px 16px 4px 16px;
                }
                .msg-time { text-align: right; }
              }
            }

            .msg-avatar { flex-shrink: 0; background: #e4e7ed; color: #606266; }

            .msg-content {
              display: flex;
              flex-direction: column;
              max-width: 70%;
              .msg-sender { font-size: 12px; color: #909399; margin-bottom: 4px; }
              .msg-bubble {
                padding: 10px 16px;
                background: #fff;
                border-radius: 16px 16px 16px 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                font-size: 14px;
                line-height: 1.5;
                color: #303133;
                word-break: break-word;
              }
              .msg-time { font-size: 11px; color: #c0c4cc; margin-top: 4px; }
            }
          }
        }

        .chat-input-area {
          :deep(.el-input__wrapper) { border-radius: 24px; }
        }
      }
    }

    .sidebar {
      .members-card {
        border-radius: 12px;
        height: fit-content;
        position: sticky;
        top: 20px;

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          h3 { margin: 0; color: #303133; font-size: 16px; font-weight: 600; }
          .member-badge { :deep(.el-badge__content) { background: #67c23a; } }
        }

        .members-list {
          .member-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f5f7fa;
            &:last-child { border-bottom: none; }

            .member-info {
              display: flex;
              align-items: center;
              gap: 12px;

              .avatar-wrapper {
                position: relative;
                .status-indicator {
                  position: absolute;
                  bottom: 0;
                  right: 0;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  border: 2px solid #fff;
                  &.online { background: #67c23a; }
                  &.busy { background: #e6a23c; }
                  &.away { background: #f56c6c; }
                  &.offline { background: #909399; }
                }
              }

              .member-details {
                display: flex;
                flex-direction: column;
                .member-name { font-weight: 500; color: #303133; font-size: 14px; }
                .member-status {
                  font-size: 12px;
                  &.online { color: #67c23a; }
                  &.busy { color: #e6a23c; }
                  &.away { color: #f56c6c; }
                  &.offline { color: #909399; }
                }
              }
            }

            .member-actions { display: flex; gap: 8px; }
          }
        }
      }
    }
  }
}
</style>
