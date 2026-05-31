import { ref } from 'vue'
import { Client, IMessage } from '@stomp/stompjs'
import type { WebSocketMessage } from '@/types'
import { ElMessage } from 'element-plus'

let stompClient: Client | null = null
const isConnected = ref(false)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5

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
  } catch (error) {
    console.error('Failed to parse WebSocket message:', error)
  }
}

export function initWebSocket() {
  if (stompClient && stompClient.active) {
    return
  }

  disconnectWebSocket()

  stompClient = new Client({
    brokerURL: `ws://${window.location.host}/ws/ws-endpoint`,
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
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected')
      isConnected.value = false
    },
    onWebSocketError: () => {
      isConnected.value = false
    },
    onWebSocketClose: () => {
      isConnected.value = false
      reconnectAttempts.value++
      if (reconnectAttempts.value > maxReconnectAttempts) {
        stompClient?.deactivate()
        ElMessage.warning('WebSocket连接失败，请稍后刷新页面重试')
      }
    }
  })

  stompClient.activate()
}

export function disconnectWebSocket() {
  if (stompClient) {
    try {
      stompClient.deactivate()
    } catch (e) {
      // ignore
    }
    stompClient = null
  }
  isConnected.value = false
  reconnectAttempts.value = 0
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
  }
}

export { isConnected }
