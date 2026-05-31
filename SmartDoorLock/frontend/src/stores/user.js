import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  async function handleLogin(loginForm) {
    const res = await login(loginForm)
    setToken(res.data.token)
    setUserInfo(res.data.userInfo)
    return res
  }

  async function handleLogout() {
    try {
      await logout()
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      clearUserInfo()
    }
  }

  function clearUserInfo() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    handleLogin,
    handleLogout,
    clearUserInfo
  }
})
