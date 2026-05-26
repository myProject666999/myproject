<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessageSquare, Plus, Users, Clock, Trash2 } from 'lucide-vue-next'
import { getRooms, createRoom, deleteRoom } from '@/utils/api'
import type { Room, CreateRoomRequest } from '@/types'

const router = useRouter()
const rooms = ref<Room[]>([])
const loading = ref(false)
const showJoinModal = ref(false)
const selectedRoom = ref<Room | null>(null)
const joinNickname = ref('')
const creatorNickname = ref('')

const form = ref<CreateRoomRequest>({
  name: '',
  creator_nickname: '',
  expires_in_hours: undefined,
})

const fetchRooms = async () => {
  try {
    rooms.value = await getRooms()
  } catch (e) {
    console.error('Failed to fetch rooms:', e)
  }
}

const handleCreateRoom = async () => {
  if (!form.value.name.trim() || !form.value.creator_nickname.trim()) {
    return
  }

  loading.value = true
  try {
    const savedNickname = form.value.creator_nickname
    const room = await createRoom(form.value)
    creatorNickname.value = savedNickname
    form.value = {
      name: '',
      creator_nickname: '',
      expires_in_hours: undefined,
    }
    await fetchRooms()
    openJoinModal(room, savedNickname)
  } catch (e) {
    console.error('Failed to create room:', e)
  } finally {
    loading.value = false
  }
}

const handleDeleteRoom = async (id: string) => {
  if (!confirm('Are you sure you want to delete this room?')) {
    return
  }

  try {
    await deleteRoom(id)
    await fetchRooms()
  } catch (e) {
    console.error('Failed to delete room:', e)
  }
}

const openJoinModal = (room: Room, prefillNickname = '') => {
  selectedRoom.value = room
  joinNickname.value = prefillNickname || creatorNickname.value
  showJoinModal.value = true
}

const handleJoinRoom = () => {
  if (!selectedRoom.value || !joinNickname.value.trim()) {
    return
  }
  router.push(`/chat/${selectedRoom.value.id}?nickname=${encodeURIComponent(joinNickname.value.trim())}`)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchRooms()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <header class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
          <MessageSquare class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Simple Chat Room</h1>
        <p class="text-gray-500 text-lg">Create or join chat rooms to connect with others</p>
      </header>

      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus class="w-5 h-5 text-blue-500" />
          Create New Room
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter room name"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              @keyup.enter="handleCreateRoom"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your Nickname</label>
            <input
              v-model="form.creator_nickname"
              type="text"
              placeholder="Enter your nickname"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              @keyup.enter="handleCreateRoom"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Expires (hours) <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              v-model.number="form.expires_in_hours"
              type="number"
              min="1"
              placeholder="Leave empty for no expiry"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              @keyup.enter="handleCreateRoom"
            />
          </div>
        </div>
        <button
          @click="handleCreateRoom"
          :disabled="loading || !form.name.trim() || !form.creator_nickname.trim()"
          class="mt-4 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          {{ loading ? 'Creating...' : 'Create Room' }}
        </button>
      </div>

      <div class="mb-4">
        <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare class="w-5 h-5 text-blue-500" />
          Active Rooms
          <span class="text-sm font-normal text-gray-400">({{ rooms.length }})</span>
        </h2>
      </div>

      <div v-if="rooms.length === 0" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <MessageSquare class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 text-lg">No active rooms yet. Create one above!</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="room in rooms"
          :key="room.id"
          class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 border border-gray-100"
        >
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-semibold text-gray-800 truncate flex-1 mr-2">{{ room.name }}</h3>
            <button
              @click.stop="handleDeleteRoom(room.id)"
              class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete room"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <Users class="w-4 h-4" />
              <span>Created by {{ room.creator_nickname }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <Clock class="w-4 h-4" />
              <span>{{ formatDate(room.created_at) }}</span>
            </div>
            <div v-if="room.expires_at" class="flex items-center gap-2 text-sm text-orange-500">
              <Clock class="w-4 h-4" />
              <span>Expires: {{ formatDate(room.expires_at) }}</span>
            </div>
          </div>

          <button
            @click="openJoinModal(room)"
            class="w-full py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showJoinModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showJoinModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Join Room</h3>
          <p class="text-gray-500 mb-4">
            Join <span class="font-medium text-gray-700">"{{ selectedRoom?.name }}"</span>
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Your Nickname</label>
            <input
              v-model="joinNickname"
              type="text"
              placeholder="Enter your nickname"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              @keyup.enter="handleJoinRoom"
              autofocus
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="showJoinModal = false"
              class="flex-1 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleJoinRoom"
              :disabled="!joinNickname.trim()"
              class="flex-1 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
