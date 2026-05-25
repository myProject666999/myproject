<template>
  <div class="ticket-detail">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div>
                <el-button link @click="$router.back()">
                  <el-icon><ArrowLeft /></el-icon>
                  返回
                </el-button>
                <span class="title">{{ ticket.title }}</span>
                <el-tag :color="ticket.statusColor" effect="dark">{{ ticket.statusName }}</el-tag>
                <el-tag :color="ticket.priorityColor" effect="dark" size="small">{{ ticket.priorityName }}</el-tag>
              </div>
              <div>
                <el-button
                  v-if="ticket.statusCode === 'pending' && userRole >= 2"
                  type="primary"
                  @click="handleClaim"
                >
                  领取工单
                </el-button>
                <el-button
                  v-if="ticket.statusCode === 'processing' && userRole >= 2"
                  type="success"
                  @click="handleResolve"
                >
                  标记解决
                </el-button>
                <el-button
                  v-if="ticket.statusCode === 'resolved' && userRole === 1"
                  @click="handleReopen"
                >
                  重新打开
                </el-button>
                <el-button
                  v-if="(ticket.statusCode === 'resolved' && userRole >= 2) || ticket.statusCode === 'pending'"
                  type="danger"
                  @click="handleClose"
                >
                  关闭工单
                </el-button>
                <el-button
                  v-if="ticket.statusCode === 'pending' && userRole === 3"
                  @click="showAssignDialog = true"
                >
                  分配工单
                </el-button>
              </div>
            </div>
          </template>

          <div class="ticket-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="工单号">{{ ticket.ticketNo }}</el-descriptions-item>
              <el-descriptions-item label="分类">{{ ticket.categoryName }}</el-descriptions-item>
              <el-descriptions-item label="提交人">{{ ticket.customerName }}</el-descriptions-item>
              <el-descriptions-item label="处理人">{{ ticket.assigneeName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatTime(ticket.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="最后消息">{{ formatTime(ticket.lastMessageAt) }}</el-descriptions-item>
              <el-descriptions-item label="来源">{{ ticket.source }}</el-descriptions-item>
              <el-descriptions-item label="渠道">{{ ticket.channel }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="ticket-content">
            <h4>问题描述</h4>
            <div class="content-text">{{ ticket.content }}</div>
          </div>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>对话记录</span>
            </div>
          </template>

          <div class="message-list" ref="messageListRef">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-item"
              :class="{ 'is-self': msg.senderId === userId, 'is-robot': msg.isRobot }"
            >
              <el-avatar :size="40">
                {{ msg.senderName?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name" :class="{ 'robot': msg.isRobot }">
                    {{ msg.isRobot ? '🤖 ' : '' }}{{ msg.senderName }}
                  </span>
                  <span class="send-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
                <div class="message-text">{{ msg.content }}</div>
              </div>
            </div>
          </div>

          <div class="message-input">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入回复内容..."
              @keyup.enter.ctrl="sendMessage"
            />
            <div class="input-actions">
              <span class="tip">按 Ctrl+Enter 发送</span>
              <el-button type="primary" :loading="sending" @click="sendMessage">
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>操作日志</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="log in operationLogs"
              :key="log.id"
              :timestamp="formatTime(log.createdAt)"
              placement="top"
            >
              <div class="log-item">
                <span class="log-operator">{{ log.operatorName }}</span>
                <span class="log-action">{{ getOperationText(log) }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showAssignDialog" title="分配工单" width="400px">
      <el-form label-width="80px">
        <el-form-item label="选择客服">
          <el-select v-model="assignAgentId" placeholder="请选择客服" style="width: 100%">
            <el-option
              v-for="agent in agentList"
              :key="agent.id"
              :label="agent.name"
              :value="agent.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTicketDetail, getTicketMessages, sendTicketMessage, getOperationLogs, claimTicket, resolveTicket, closeTicket, reopenTicket, assignTicket } from '@/api/ticket'
import { getAgentList } from '@/api/user'
import dayjs from 'dayjs'

const route = useRoute()
const userStore = useUserStore()
const userId = userStore.userId
const userRole = userStore.userRole

const ticket = ref({})
const messages = ref([])
const operationLogs = ref([])
const inputMessage = ref('')
const sending = ref(false)
const showAssignDialog = ref(false)
const assignAgentId = ref('')
const agentList = ref([])
const messageListRef = ref(null)
let ws = null

function formatTime(time) {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function getOperationText(log) {
  const typeMap = {
    create: '创建工单',
    assign: '分配工单',
    claim: '领取工单',
    transition: '状态变更',
    reply: '回复消息',
    update: '修改信息'
  }
  let text = typeMap[log.operationType] || log.operationType
  if (log.fromStatus && log.toStatus) {
    text += `: ${log.fromStatus} -> ${log.toStatus}`
  }
  return text
}

async function loadTicket() {
  const res = await getTicketDetail(route.params.id)
  if (res.code === 0) {
    ticket.value = res.data
  }
}

async function loadMessages() {
  const res = await getTicketMessages(route.params.id, { page: 1, pageSize: 100 })
  if (res.code === 0) {
    messages.value = res.data || []
    nextTick(() => {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight
      }
    })
  }
}

async function loadOperationLogs() {
  const res = await getOperationLogs(route.params.id)
  if (res.code === 0) {
    operationLogs.value = res.data || []
  }
}

async function loadAgents() {
  const res = await getAgentList()
  if (res.code === 0) {
    agentList.value = res.data || []
  }
}

async function sendMessage() {
  if (!inputMessage.value.trim()) return
  
  sending.value = true
  try {
    const res = await sendTicketMessage({
      ticketId: ticket.value.id,
      content: inputMessage.value,
      messageType: 1
    })
    if (res.code === 0) {
      inputMessage.value = ''
      loadMessages()
    } else {
      ElMessage.error(res.message || '发送失败')
    }
  } catch (error) {
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

async function handleClaim() {
  try {
    await ElMessageBox.confirm('确定要领取此工单吗？', '提示')
    const res = await claimTicket(ticket.value.id)
    if (res.code === 0) {
      ElMessage.success('领取成功')
      loadTicket()
    } else {
      ElMessage.error(res.message || '领取失败')
    }
  } catch (e) {}
}

async function handleResolve() {
  try {
    await ElMessageBox.confirm('确定要标记此工单为已解决吗？', '提示')
    const res = await resolveTicket(ticket.value.id)
    if (res.code === 0) {
      ElMessage.success('已标记解决')
      loadTicket()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {}
}

async function handleClose() {
  try {
    await ElMessageBox.confirm('确定要关闭此工单吗？', '提示')
    const res = await closeTicket(ticket.value.id)
    if (res.code === 0) {
      ElMessage.success('工单已关闭')
      loadTicket()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {}
}

async function handleReopen() {
  try {
    await ElMessageBox.confirm('确定要重新打开此工单吗？', '提示')
    const res = await reopenTicket(ticket.value.id)
    if (res.code === 0) {
      ElMessage.success('工单已重新打开')
      loadTicket()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {}
}

async function handleAssign() {
  if (!assignAgentId.value) {
    ElMessage.warning('请选择客服')
    return
  }
  const res = await assignTicket({
    ticketId: ticket.value.id,
    assigneeId: assignAgentId.value
  })
  if (res.code === 0) {
    ElMessage.success('分配成功')
    showAssignDialog.value = false
    loadTicket()
  } else {
    ElMessage.error(res.message || '分配失败')
  }
}

function initWebSocket() {
  const token = localStorage.getItem('token')
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${wsProtocol}//${window.location.host}/ws/ticket/${ticket.value.id}?token=${token}`
  
  ws = new WebSocket(wsUrl)
  
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'message' && msg.userId !== userId) {
      loadMessages()
    }
  }
}

onMounted(() => {
  loadTicket()
  loadMessages()
  loadOperationLogs()
  loadAgents()
  setTimeout(initWebSocket, 1000)
})

onBeforeUnmount(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 18px;
    font-weight: bold;
    margin: 0 10px;
  }
}

.ticket-info {
  margin-bottom: 20px;
}

.ticket-content {
  margin-top: 20px;

  h4 {
    margin-bottom: 10px;
  }

  .content-text {
    background: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    white-space: pre-wrap;
  }
}

.message-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;

  .message-item {
    display: flex;
    margin-bottom: 20px;

    &.is-self {
      flex-direction: row-reverse;

      .message-content {
        margin-left: 0;
        margin-right: 10px;
      }

      .message-header {
        text-align: right;
      }
    }

    &.is-robot {
      .sender-name {
        color: #409EFF;
      }
    }

    .message-content {
      flex: 1;
      margin-left: 10px;

      .message-header {
        margin-bottom: 5px;

        .sender-name {
          font-weight: bold;
          margin-right: 10px;

          &.robot {
            color: #409EFF;
          }
        }

        .send-time {
          color: #909399;
          font-size: 12px;
        }
      }

      .message-text {
        background: #f5f7fa;
        padding: 10px 15px;
        border-radius: 8px;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
}

.message-input {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;

  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;

    .tip {
      color: #909399;
      font-size: 12px;
    }
  }
}

.log-item {
  .log-operator {
    font-weight: bold;
    margin-right: 8px;
  }

  .log-action {
    color: #606266;
  }
}
</style>
