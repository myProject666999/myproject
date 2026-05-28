import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials) {
    const res = await request.post('/api/user/login', credentials)
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    return res.data
  }

  async function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  async function register(data) {
    const res = await request.post('/api/user/register', data)
    return res.data
  }

  async function fetchUserInfo() {
    const res = await request.get('/api/user/info')
    userInfo.value = res.data
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    return res.data
  }

  async function updateStatus(onlineStatus, busyMode, textStatus) {
    const res = await request.post('/api/status/update', {
      online_status: onlineStatus,
      busy_mode: busyMode,
      text_status: textStatus
    })
    return res.data
  }

  async function setBusyMode(busyMode) {
    const res = await request.post('/api/status/busy', {
      busy_mode: busyMode
    })
    return res.data
  }

  async function heartbeat() {
    await request.post('/api/status/heartbeat')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    register,
    fetchUserInfo,
    updateStatus,
    setBusyMode,
    heartbeat
  }
})
