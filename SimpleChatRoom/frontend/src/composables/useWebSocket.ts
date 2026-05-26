import { ref, reactive } from 'vue'
import type { Message, SystemMessage } from '@/types'
import { MessageType } from '@/types'

export function useWebSocket(roomId: string, nickname: string) {
  const messages = reactive<Message[]>([])
  const connected = ref(false)
  const onlineCount = ref(0)
  const error = ref<string | null>(null)
  let ws: WebSocket | null = null

  const connect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/${roomId}?nickname=${encodeURIComponent(nickname)}`

    try {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        connected.value = true
        error.value = null
        onlineCount.value = 1
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'join' || data.type === 'leave') {
            const sysMsg = data as SystemMessage
            if (sysMsg.type === 'join') {
              onlineCount.value++
            } else if (sysMsg.type === 'leave') {
              onlineCount.value = Math.max(0, onlineCount.value - 1)
            }
            return
          }

          const message = data as Message
          message.is_self = message.nickname === nickname
          messages.push(message)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      ws.onclose = () => {
        connected.value = false
      }

      ws.onerror = () => {
        error.value = 'WebSocket connection error'
        connected.value = false
      }
    } catch (e) {
      error.value = 'Failed to connect to WebSocket'
      connected.value = false
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
    connected.value = false
    onlineCount.value = 0
  }

  const sendMessage = (type: number, content?: string, imageUrl?: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      error.value = 'Not connected to chat'
      return
    }

    const message = {
      content: content || '',
      image_url: imageUrl || '',
      message_type: type,
    }

    ws.send(JSON.stringify(message))
  }

  const sendTextMessage = (content: string) => {
    sendMessage(MessageType.Text, content)
  }

  const sendImageMessage = (imageUrl: string) => {
    sendMessage(MessageType.Image, undefined, imageUrl)
  }

  const setInitialMessages = (initialMessages: Message[]) => {
    messages.length = 0
    initialMessages.forEach((msg) => {
      msg.is_self = msg.nickname === nickname
      messages.push(msg)
    })
  }

  return {
    messages,
    connected,
    onlineCount,
    error,
    connect,
    disconnect,
    sendMessage,
    sendTextMessage,
    sendImageMessage,
    setInitialMessages,
  }
}
