import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import { useRoomStore } from './room'
import WebSocketClient from '@/utils/ws'

export const useWsStore = defineStore('ws', () => {
  const connected = ref(false)
  const reconnecting = ref(false)
  const messages = ref([])
  const incomingCall = ref(null)
  const client = ref(null)

  function connect() {
    const userStore = useUserStore()
    if (!userStore.token) return

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/ws?token=${userStore.token}`

    client.value = new WebSocketClient({
      url: wsUrl,
      onOpen: () => {
        connected.value = true
        reconnecting.value = false
      },
      onClose: () => {
        connected.value = false
      },
      onReconnect: () => {
        reconnecting.value = true
      },
      onMessage: handleMessage
    })

    client.value.connect()
  }

  function disconnect() {
    if (client.value) {
      client.value.disconnect()
      client.value = null
    }
    connected.value = false
    reconnecting.value = false
  }

  function send(message) {
    if (client.value && connected.value) {
      client.value.send(message)
    }
  }

  function handleMessage(data) {
    const roomStore = useRoomStore()
    messages.value.push(data)

    switch (data.type) {
      case 'status_update':
        roomStore.updateUserStatus(data.userId, data.status)
        break
      case 'user_joined':
        roomStore.addUser(data.user)
        break
      case 'user_left':
        roomStore.removeUser(data.userId)
        break
      case 'room_message':
        break
      case 'private_message':
        break
      case 'call_incoming':
        incomingCall.value = data.call
        break
      case 'call_answered':
        incomingCall.value = null
        break
      case 'call_rejected':
        incomingCall.value = null
        break
      case 'call_ended':
        incomingCall.value = null
        break
    }
  }

  function sendStatusUpdate(status) {
    send({
      type: 'status_update',
      status
    })
  }

  function sendRoomMessage(roomId, content) {
    send({
      type: 'room_message',
      roomId,
      content
    })
  }

  function sendPrivateMessage(toUserId, content) {
    send({
      type: 'private_message',
      toUserId,
      content
    })
  }

  function startCall(toUserId, callType) {
    send({
      type: 'call_start',
      toUserId,
      callType
    })
  }

  function answerCall(callId) {
    send({
      type: 'call_answer',
      callId
    })
    incomingCall.value = null
  }

  function rejectCall(callId) {
    send({
      type: 'call_reject',
      callId
    })
    incomingCall.value = null
  }

  function endCall(callId) {
    send({
      type: 'call_end',
      callId
    })
    incomingCall.value = null
  }

  return {
    connected,
    reconnecting,
    messages,
    incomingCall,
    connect,
    disconnect,
    send,
    sendStatusUpdate,
    sendRoomMessage,
    sendPrivateMessage,
    startCall,
    answerCall,
    rejectCall,
    endCall
  }
})
