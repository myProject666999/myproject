import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 1)

  function setToken(t) {
    token.value = t
    localStorage.setItem('group_buying_token', t)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('group_buying_user', JSON.stringify(info))
  }

  function restoreFromLocalStorage() {
    const savedToken = localStorage.getItem('group_buying_token')
    const savedUser = localStorage.getItem('group_buying_user')
    if (savedToken) {
      token.value = savedToken
    }
    if (savedUser) {
      try {
        userInfo.value = JSON.parse(savedUser)
      } catch {
        userInfo.value = null
      }
    }
  }

  async function login(username, password) {
    const res = await authApi.login({ username, password })
    if (res.data?.token) {
      setToken(res.data.token)
      if (res.data.user) {
        setUserInfo(res.data.user)
      } else {
        await fetchUserInfo()
      }
    }
    return res
  }

  async function register(data) {
    const res = await authApi.register(data)
    return res
  }

  async function fetchUserInfo() {
    try {
      const res = await userApi.getInfo()
      if (res.data) {
        setUserInfo(res.data)
      }
      return res
    } catch {
      return null
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('group_buying_token')
    localStorage.removeItem('group_buying_user')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    fetchUserInfo,
    restoreFromLocalStorage,
    setUserInfo
  }
})
