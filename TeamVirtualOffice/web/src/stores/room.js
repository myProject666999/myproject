import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useRoomStore = defineStore('room', () => {
  const rooms = ref([])
  const currentRoom = ref(null)
  const users = ref([])
  const loading = ref(false)

  const occupiedSeats = computed(() => {
    if (!currentRoom.value || !currentRoom.value.seats) return new Set()
    const occupied = new Set()
    currentRoom.value.seats.forEach(seat => {
      if (seat.is_occupied) occupied.add(seat.id)
    })
    return occupied
  })

  async function fetchRooms() {
    loading.value = true
    try {
      const response = await request.get('/api/room/list')
      rooms.value = response.data
      return response.data
    } finally {
      loading.value = false
    }
  }

  async function fetchRoomDetail(roomId) {
    loading.value = true
    try {
      const response = await request.get(`/api/room/${roomId}`)
      currentRoom.value = response.data
      return response.data
    } finally {
      loading.value = false
    }
  }

  async function joinRoom(roomId) {
    const response = await request.post(`/api/room/join/${roomId}`)
    return response.data
  }

  async function leaveRoom(roomId) {
    const response = await request.post(`/api/room/leave/${roomId}`)
    return response.data
  }

  async function occupySeat(seatId) {
    const response = await request.post(`/api/seat/occupy/${seatId}`)
    return response.data
  }

  async function leaveSeat(seatId) {
    const response = await request.post(`/api/seat/leave/${seatId}`)
    return response.data
  }

  function updateUserStatus(userId, status) {
    const user = users.value.find(u => u.id === userId)
    if (user) {
      user.status = status
    }
  }

  function addUser(user) {
    const existing = users.value.find(u => u.id === user.id)
    if (!existing) {
      users.value.push(user)
    }
  }

  function removeUser(userId) {
    const index = users.value.findIndex(u => u.id === userId)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }

  return {
    rooms,
    currentRoom,
    users,
    loading,
    occupiedSeats,
    fetchRooms,
    fetchRoomDetail,
    joinRoom,
    leaveRoom,
    occupySeat,
    leaveSeat,
    updateUserStatus,
    addUser,
    removeUser
  }
})
