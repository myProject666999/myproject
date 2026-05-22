import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAuthor = computed(() => userInfo.value?.role === 'author' || userInfo.value?.role === 'admin')
  const isAdmin = computed(() => userInfo.value?.role === 'admin')

  function setAuth(newToken, user) {
    token.value = newToken
    userInfo.value = user
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(user))
  }

  function clearAuth() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function updateProfile() {
    try {
      const res = await userApi.getProfile()
      if (res.user) {
        userInfo.value = res.user
        localStorage.setItem('user', JSON.stringify(res.user))
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAuthor,
    isAdmin,
    setAuth,
    clearAuth,
    updateProfile
  }
})
