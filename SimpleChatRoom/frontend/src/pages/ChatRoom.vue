<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Send, Image, ArrowLeft, Trash2, Users } from 'lucide-vue-next'
import { useWebSocket } from '@/composables/useWebSocket'
import { getMessages, getRooms, deleteRoom, uploadImage } from '@/utils/api'
import MessageBubble from '@/components/MessageBubble.vue'
import type { Room } from '@/types'

const route = useRoute()
const router = useRouter()
const roomId = route.params.roomId as string
const nickname = ref('')
const room = ref<Room | null>(null)
const newMessage = ref('')
const isUploading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

nickname.value = new URLSearchParams(window.location.search).get('nickname') || ''

const {
  messages,
  connected,
  onlineCount,
  error,
  connect,
  disconnect,
  sendTextMessage,
  sendImageMessage,
  setInitialMessages,
} = useWebSocket(roomId, nickname.value)

const fetchRoomInfo = async () => {
  try {
    const rooms = await getRooms()
    room.value = rooms.find((r) => r.id === roomId) || null
  } catch (e) {
    console.error('Failed to fetch room info:', e)
  }
}

const fetchInitialMessages = async () => {
  try {
    const msgs = await getMessages(roomId)
    setInitialMessages(msgs)
  } catch (e) {
    console.error('Failed to fetch messages:', e)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(
  () => messages.length,
  () => {
    scrollToBottom()
  }
)

const handleSendMessage = () => {
  if (!newMessage.value.trim() || !connected.value) {
    return
  }
  sendTextMessage(newMessage.value.trim())
  newMessage.value = ''
}

const handleImageUpload = async () => {
  if (!fileInput.value?.files?.length) {
    return
  }

  const file = fileInput.value.files[0]
  isUploading.value = true

  try {
    const result = await uploadImage(file)
    sendImageMessage(result.url)
  } catch (e) {
    console.error('Failed to upload image:', e)
    alert('Failed to upload image')
  } finally {
    isUploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleBack = () => {
  disconnect()
  router.push('/')
}

const handleDeleteRoom = async () => {
  if (!confirm('Are you sure you want to delete this room?')) {
    return
  }

  try {
    await deleteRoom(roomId)
    disconnect()
    router.push('/')
  } catch (e) {
    console.error('Failed to delete room:', e)
  }
}

const isCreator = () => {
  return room.value?.creator_nickname === nickname.value
}

onMounted(async () => {
  if (!nickname.value) {
    router.push('/')
    return
  }

  await fetchRoomInfo()
  await fetchInitialMessages()
  connect()
  scrollToBottom()
})

onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="handleBack"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to rooms"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 class="text-lg font-semibold text-gray-800">{{ room?.name || 'Chat Room' }}</h1>
          <div class="flex items-center gap-1.5 text-sm text-gray-500">
            <Users class="w-3.5 h-3.5" />
            <span>{{ onlineCount }} online</span>
            <span v-if="connected" class="text-green-500 text-xs">• Connected</span>
            <span v-else class="text-red-500 text-xs">• Disconnected</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="isCreator()"
          @click="handleDeleteRoom"
          class="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete room"
        >
          <Trash2 class="w-5 h-5 text-red-500" />
        </button>
      </div>
    </header>

    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-4"
    >
      <div class="max-w-4xl mx-auto">
        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {{ error }}
        </div>

        <div v-if="messages.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
            <Send class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-500">No messages yet. Start the conversation!</p>
        </div>

        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :is-self="!!message.is_self"
        />
      </div>
    </div>

    <div class="bg-white border-t border-gray-200 px-4 py-3">
      <div class="max-w-4xl mx-auto flex items-center gap-3">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        />
        <button
          @click="fileInput?.click()"
          :disabled="!connected || isUploading"
          class="p-2.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload image"
        >
          <Image class="w-5 h-5 text-gray-500" />
        </button>
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 px-4 py-2.5 bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          :disabled="!connected"
          @keyup.enter="handleSendMessage"
        />
        <button
          @click="handleSendMessage"
          :disabled="!newMessage.trim() || !connected"
          class="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
