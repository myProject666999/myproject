<template>
  <div class="members-page">
    <el-card class="header-card" shadow="never">
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" circle @click="goBack" />
          <div class="header-info">
            <h1>Team Members</h1>
            <p>View all team members and their current status</p>
          </div>
        </div>
        <div class="header-right">
          <el-tag type="success">{{ onlineCount }} online</el-tag>
          <el-tag type="info">{{ members.length }} total</el-tag>
        </div>
      </div>
    </el-card>
    <el-card class="filters-card" shadow="never">
      <div class="filters-row">
        <el-input
          v-model="searchQuery"
          placeholder="Search members..."
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select
          v-model="statusFilter"
          placeholder="Filter by status"
          clearable
          class="status-filter"
        >
          <el-option label="All Status" value="" />
          <el-option label="Online" :value="1" />
          <el-option label="Busy" :value="2" />
          <el-option label="Away" :value="3" />
          <el-option label="Offline" :value="0" />
        </el-select>
        <el-button type="primary" @click="refreshMembers">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </el-card>
    <el-card class="table-card" shadow="never">
      <el-table :data="filteredMembers" style="width: 100%" :loading="loading" stripe>
        <el-table-column label="Member" min-width="200">
          <template #default="{ row }">
            <div class="member-cell">
              <div class="avatar-wrapper">
                <el-avatar :size="44">
                  {{ (row.nickname || row.username || 'U')?.charAt(0) }}
                </el-avatar>
                <span class="status-indicator" :class="getStatusClass(row.online_status)"></span>
              </div>
              <div class="member-details">
                <span class="member-name">{{ row.nickname || row.username }}</span>
                <span class="member-username">@{{ row.username }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.online_status)" size="small" effect="light">
              {{ getStatusLabel(row.online_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Busy Mode" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.busy_mode === 1" type="danger" size="small">DND</el-tag>
            <el-tag v-else type="info" size="small" effect="plain">Off</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status Text" min-width="180">
          <template #default="{ row }">
            <span class="text-status">{{ row.text_status || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="Voice Call" placement="top">
                <el-button
                  :icon="Phone"
                  circle
                  size="small"
                  type="success"
                  :disabled="row.online_status === 0"
                  @click="callUser(row, 1)"
                />
              </el-tooltip>
              <el-tooltip content="Video Call" placement="top">
                <el-button
                  :icon="VideoCamera"
                  circle
                  size="small"
                  type="primary"
                  :disabled="row.online_status === 0"
                  @click="callUser(row, 2)"
                />
              </el-tooltip>
              <el-tooltip content="Send Message" placement="top">
                <el-button
                  :icon="ChatDotRound"
                  circle
                  size="small"
                  type="warning"
                  @click="openChat(row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper" v-if="filteredMembers.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredMembers.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Search,
  Refresh,
  Phone,
  VideoCamera,
  ChatDotRound
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useWsStore } from '@/stores/ws'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const wsStore = useWsStore()

const members = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

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

const onlineCount = computed(() => {
  return members.value.filter(m => m.online_status !== 0).length
})

const filteredMembers = computed(() => {
  let result = [...members.value]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m =>
      (m.nickname || m.username || '').toLowerCase().includes(query) ||
      (m.username || '').toLowerCase().includes(query)
    )
  }
  if (statusFilter.value !== '' && statusFilter.value !== null) {
    result = result.filter(m => m.online_status === statusFilter.value)
  }
  return result
})

function getStatusClass(status) {
  const map = { 1: 'online', 2: 'busy', 3: 'away', 0: 'offline' }
  return map[status] || 'offline'
}

function getStatusLabel(status) {
  const map = { 1: 'Online', 2: 'Busy', 3: 'Away', 0: 'Offline' }
  return map[status] || 'Offline'
}

function getStatusType(status) {
  const map = { 1: 'success', 2: 'warning', 3: 'danger', 0: 'info' }
  return map[status] || 'info'
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function goBack() {
  router.push('/office')
}

async function fetchMembers() {
  loading.value = true
  try {
    const response = await request.get('/api/user/list')
    members.value = response.data || []
  } catch (e) {
    ElMessage.error('Failed to fetch members')
  } finally {
    loading.value = false
  }
}

function refreshMembers() {
  fetchMembers()
  ElMessage.success('Refreshed')
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
    if (msg.includes('DND') || msg.includes('dnd')) {
      callState.value = 'dnd'
    } else if (msg.includes('offline')) {
      callState.value = 'rejected'
      ElMessage.error('User is offline')
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

async function openChat(user) {
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
}, { deep: true })

onMounted(() => {
  fetchMembers()
})
</script>

<style lang="scss" scoped>
.members-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;

  .header-card {
    margin-bottom: 16px;
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
      .header-right { display: flex; gap: 12px; }
    }
  }

  .filters-card {
    margin-bottom: 16px;
    border-radius: 12px;
    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      .search-input { flex: 1; max-width: 320px; }
      .status-filter { width: 180px; }
    }
  }

  .table-card {
    border-radius: 12px;
    .member-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      .avatar-wrapper {
        position: relative;
        .status-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 14px;
          height: 14px;
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
        .member-username { font-size: 12px; color: #909399; }
      }
    }
    .text-status { color: #606266; font-size: 13px; }
    .action-buttons { display: flex; gap: 8px; }
    .pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }
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
