<template>
  <div class="room-page">
    <el-card class="header-card" shadow="never">
      <div class="room-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" circle @click="goBack" />
          <div class="room-info">
            <h1>{{ roomStore.currentRoom?.name }}</h1>
            <p>{{ roomStore.currentRoom?.description }}</p>
          </div>
        </div>
        <div class="header-right">
          <el-tag type="success" v-if="mySeat">
            Seat #{{ mySeat }}
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
            <span>{{ occupiedCount }}/{{ totalSeats }} occupied</span>
          </div>
          <div class="seats-grid">
            <div
              v-for="seat in seats"
              :key="seat.id"
              class="seat-item"
              :class="{
                occupied: seat.occupied,
                mine: seat.isMine,
                empty: !seat.occupied
              }"
              @click="handleSeatClick(seat)"
            >
              <div class="seat-content">
                <div v-if="seat.occupied && seat.user" class="occupied-seat">
                  <el-avatar :size="32" class="seat-avatar">
                    {{ (seat.user.nickname || seat.user.username)?.charAt(0) }}
                  </el-avatar>
                  <span class="seat-user">
                    {{ seat.user.nickname || seat.user.username }}
                  </span>
                </div>
                <div v-else class="empty-seat">
                  <el-icon :size="24"><Box /></el-icon>
                </div>
              </div>
              <div class="seat-number">#{{ seat.id }}</div>
              <div class="seat-position">({{ seat.x }}, {{ seat.y }})</div>
            </div>
          </div>
        </el-card>
        <el-card class="chat-card" shadow="never">
          <div class="section-title">
            <h3>Room Chat</h3>
            <el-badge :value="unreadMessages" class="msg-badge" />
          </div>
          <div class="chat-messages" ref="messagesContainer">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-item"
              :class="{ own: msg.isOwn }"
            >
              <el-avatar v-if="!msg.isOwn" :size="32" class="msg-avatar">
                {{ (msg.user?.nickname || msg.user?.username)?.charAt(0) }}
              </el-avatar>
              <div class="msg-content">
                <div v-if="!msg.isOwn" class="msg-sender">
                  {{ msg.user?.nickname || msg.user?.username }}
                </div>
                <div class="msg-bubble">
                  {{ msg.content }}
                </div>
                <div class="msg-time">
                  {{ formatTime(msg.timestamp) }}
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
            <el-badge :value="roomStore.users.length" class="member-badge" />
          </div>
          <div class="members-list">
            <div
              v-for="user in roomStore.users"
              :key="user.id"
              class="member-item"
            >
              <div class="member-info">
                <div class="avatar-wrapper">
                  <el-avatar :size="40">
                    {{ (user.nickname || user.username)?.charAt(0) }}
                  </el-avatar>
                  <span class="status-indicator" :class="user.status"></span>
                </div>
                <div class="member-details">
                  <span class="member-name">{{ user.nickname || user.username }}</span>
                  <span class="member-status" :class="user.status">
                    {{ user.status }}
                  </span>
                </div>
              </div>
              <div class="member-actions">
                <el-button
                  :icon="Phone"
                  circle
                  size="small"
                  type="success"
                  @click="callUser(user, 'voice')"
                />
                <el-button
                  :icon="VideoCamera"
                  circle
                  size="small"
                  type="primary"
                  @click="callUser(user, 'video')"
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
import { useRoomStore } from '@/stores/room'
import { useWsStore } from '@/stores/ws'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const roomStore = useRoomStore()
const wsStore = useWsStore()

const roomId = ref(route.params.id)
const messageInput = ref('')
const messages = ref([])
const unreadMessages = ref(0)
const messagesContainer = ref(null)

const totalSeats = 20

const seats = computed(() => {
  const seatList = []
  const gridSize = 5
  for (let i = 1; i <= totalSeats; i++) {
    const x = ((i - 1) % gridSize) + 1
    const y = Math.floor((i - 1) / gridSize) + 1
    const user = roomStore.users.find(u => u.seatId === i)
    seatList.push({
      id: i,
      x,
      y,
      occupied: !!user,
      isMine: user?.id === userStore.userInfo?.id,
      user
    })
  }
  return seatList
})

const occupiedCount = computed(() => {
  return roomStore.users.filter(u => u.seatId).length
})

const mySeat = computed(() => {
  const me = roomStore.users.find(u => u.id === userStore.userInfo?.id)
  return me?.seatId || null
})

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function goBack() {
  router.push('/office')
}

async function leaveRoom() {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to leave this room?',
      'Leave Room',
      {
        confirmButtonText: 'Leave',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    await roomStore.leaveRoom(roomId.value)
    router.push('/office')
  } catch {
  }
}

async function handleSeatClick(seat) {
  if (seat.isMine) {
    try {
      await ElMessageBox.confirm(
        'Are you sure you want to leave this seat?',
        'Leave Seat',
        {
          confirmButtonText: 'Leave',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
      await roomStore.takeSeat(roomId.value, null)
      ElMessage.success('You left the seat')
      await roomStore.fetchRoomDetail(roomId.value)
    } catch {
    }
  } else if (!seat.occupied) {
    try {
      await roomStore.takeSeat(roomId.value, seat.id)
      ElMessage.success(`You took seat #${seat.id}`)
      await roomStore.fetchRoomDetail(roomId.value)
    } catch (e) {
      ElMessage.error(e.response?.data?.message || 'Failed to take seat')
    }
  } else {
    ElMessage.info('This seat is occupied')
  }
}

function sendMessage() {
  if (!messageInput.value.trim()) return
  wsStore.sendRoomMessage(roomId.value, messageInput.value)
  messages.value.push({
    id: Date.now(),
    content: messageInput.value,
    user: userStore.userInfo,
    timestamp: new Date().toISOString(),
    isOwn: true
  })
  messageInput.value = ''
  scrollToBottom()
}

function callUser(user, type) {
  wsStore.startCall(user.id, type)
  ElMessage.info(`Starting ${type} call with ${user.nickname || user.username}`)
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function handleWsMessage(data) {
  if (data.type === 'room_message' && data.roomId === roomId.value) {
    messages.value.push({
      id: Date.now(),
      content: data.content,
      user: data.user,
      timestamp: data.timestamp,
      isOwn: data.user?.id === userStore.userInfo?.id
    })
    scrollToBottom()
  }
}

watch(() => wsStore.messages, (newMessages) => {
  const latest = newMessages[newMessages.length - 1]
  if (latest) {
    handleWsMessage(latest)
  }
}, { deep: true })

onMounted(async () => {
  await roomStore.fetchRoomDetail(roomId.value)
})

onUnmounted(() => {
})
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

          h3 {
            margin: 0;
            color: #303133;
            font-size: 16px;
            font-weight: 600;
          }

          span {
            color: #909399;
            font-size: 14px;
          }
        }

        .seats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;

          .seat-item {
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;

            &.empty {
              background: #f5f7fa;
              border: 2px dashed #dcdfe6;

              &:hover {
                border-color: #409eff;
                background: #ecf5ff;
              }

              .empty-seat {
                color: #c0c4cc;
              }
            }

            &.occupied {
              background: #f5f7fa;
              border: 2px solid #dcdfe6;

              &:hover {
                border-color: #e6a23c;
              }
            }

            &.mine {
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
              border: 2px solid #667eea;

              &:hover {
                border-color: #764ba2;
              }
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

                .seat-avatar {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #fff;
                }

                .seat-user {
                  font-size: 12px;
                  color: #303133;
                  max-width: 80px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
            }

            .seat-number {
              font-size: 11px;
              color: #909399;
              font-weight: 600;
            }

            .seat-position {
              font-size: 10px;
              color: #c0c4cc;
            }
          }
        }
      }

      .chat-card {
        border-radius: 12px;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 400px;

        .section-title {
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

            p {
              margin: 12px 0 0 0;
              font-size: 14px;
            }
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

                .msg-time {
                  text-align: right;
                }
              }
            }

            .msg-avatar {
              flex-shrink: 0;
              background: #e4e7ed;
              color: #606266;
            }

            .msg-content {
              display: flex;
              flex-direction: column;
              max-width: 70%;

              .msg-sender {
                font-size: 12px;
                color: #909399;
                margin-bottom: 4px;
              }

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

              .msg-time {
                font-size: 11px;
                color: #c0c4cc;
                margin-top: 4px;
              }
            }
          }
        }

        .chat-input-area {
          :deep(.el-input__wrapper) {
            border-radius: 24px;
          }
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

          h3 {
            margin: 0;
            color: #303133;
            font-size: 16px;
            font-weight: 600;
          }

          .member-badge {
            :deep(.el-badge__content) {
              background: #67c23a;
            }
          }
        }

        .members-list {
          .member-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f5f7fa;

            &:last-child {
              border-bottom: none;
            }

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

              .member-details {
                display: flex;
                flex-direction: column;

                .member-name {
                  font-weight: 500;
                  color: #303133;
                  font-size: 14px;
                }

                .member-status {
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

            .member-actions {
              display: flex;
              gap: 8px;
            }
          }
        }
      }
    }
  }
}
</style>
