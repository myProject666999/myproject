import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import { authApi } from '../api'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  const isLoggedIn = computed(() => !!token.value)

  function init() {
    if (!token.value) {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      if (savedToken) token.value = savedToken
      if (savedUser) user.value = JSON.parse(savedUser)
    }
  }

  async function login(phone: string, password: string) {
    const res = await authApi.login({ phone, password })
    if (res.code === 0 && res.data) {
      user.value = res.data
      token.value = res.data.token || ''
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      return res.data
    }
    return null
  }

  async function register(phone: string, password: string, nickname: string) {
    const res = await authApi.register({ phone, password, nickname })
    return res.code === 0
  }

  async function fetchProfile() {
    const res = await authApi.getProfile()
    if (res.code === 0 && res.data) {
      user.value = res.data
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    isLoggedIn,
    init,
    login,
    register,
    fetchProfile,
    logout
  }
})
