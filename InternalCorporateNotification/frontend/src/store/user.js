import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const token = ref(localStorage.getItem('token') || '')
  const unreadCount = ref(0)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 1)

  function setUser(data) {
    userInfo.value = data
    token.value = data.token
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  function logout() {
    userInfo.value = {}
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  function setUnreadCount(count) {
    unreadCount.value = count
  }

  return {
    userInfo,
    token,
    unreadCount,
    isLoggedIn,
    isAdmin,
    setUser,
    logout,
    setUnreadCount
  }
})
