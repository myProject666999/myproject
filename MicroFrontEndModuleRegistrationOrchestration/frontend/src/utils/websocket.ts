import { ref } from 'vue'
import SockJS from 'sockjs-client'
import { Client, IMessage } from '@stomp/stompjs'
import type { WebSocketMessage } from '@/types'
import { ElMessage } from 'element-plus'

let stompClient: Client | null = null
const isConnected = ref(false)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 10

type MessageHandler = (message: WebSocketMessage) => void

const messageHandlers: Map<string, Set<MessageHandler>> = new Map()

const topics = [
  '/topic/config',
  '/topic/app/status',
  '/topic/health',
  '/topic/gray',
  '/topic/publish'
]

function handleMessage(frame: IMessage) {
  try {
    const message: WebSocketMessage = JSON.parse(frame.body)
    const destination = frame.headers.destination
    
    const handlers = messageHandlers.get(destination)
    if (handlers) {
      handlers.forEach((handler) => handler(message))
    }
    
    if (message.type === 'CONFIG_CHANGED') {
      ElMessage.info(`配置已更新: ${message.data?.configKey || ''}`)
    } else if (message.type === 'APP_STATUS_CHANGED') {
      const statusText = message.data?.status === 1 ? '上线' : '下线'
      ElMessage.info(`应用【${message.data?.appName}】已${statusText}`)
    } else if (message.type === 'HEALTH_ALERT') {
      if (message.data?.healthStatus === 0) {
        ElMessage.warning(`应用【${message.data?.appCode}】健康检查异常`)
      }
    } else if (message.type === 'PUBLISH_PROGRESS') {
      ElMessage.info(`发布进度: ${message.data?.progress}%`)
    }
  } catch (error) {
    console.error('Failed to parse WebSocket message:', error)
  }
}

export function initWebSocket() {
  if (stompClient && isConnected.value) {
    return
  }

  const socket = new SockJS('/ws/ws-endpoint')
  
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      console.log('WebSocket connected')
      isConnected.value = true
      reconnectAttempts.value = 0
      
      topics.forEach((topic) => {
        stompClient?.subscribe(topic, handleMessage)
      })
      
      ElMessage.success('实时推送已连接')
    },
    onStompError: (frame) => {
      console.error('WebSocket error:', frame)
      ElMessage.error('WebSocket连接异常')
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected')
      isConnected.value = false
      
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        console.log(`Reconnecting... attempt ${reconnectAttempts.value}`)
      } else {
        ElMessage.warning('WebSocket重连次数已达上限，请刷新页面重试')
      }
    },
    onWebSocketError: (error) => {
      console.error('WebSocket transport error:', error)
    },
    onWebSocketClose: () => {
      isConnected.value = false
    }
  })

  stompClient.activate()
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
    isConnected.value = false
    console.log('WebSocket disconnected manually')
  }
}

export function subscribe(topic: string, handler: MessageHandler): () => void {
  if (!messageHandlers.has(topic)) {
    messageHandlers.set(topic, new Set())
  }
  
  const handlers = messageHandlers.get(topic)!
  handlers.add(handler)
  
  return () => {
    handlers.delete(handler)
    if (handlers.size === 0) {
      messageHandlers.delete(topic)
    }
  }
}

export function send(destination: string, data: any) {
  if (stompClient && isConnected.value) {
    stompClient.publish({
      destination,
      body: JSON.stringify(data)
    })
  } else {
    ElMessage.warning('WebSocket未连接，请稍后重试')
  }
}

export { isConnected }
