import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAuthor = computed(() => user.value?.role === 2)

  async function login(loginForm) {
    const data = await authApi.login(loginForm)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function register(registerForm) {
    const data = await authApi.register(registerForm)
    return data
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function fetchProfile() {
    try {
      const data = await authApi.getProfile()
      user.value = data
      localStorage.setItem('user', JSON.stringify(data))
    } catch (e) {
      console.error(e)
    }
  }

  return { token, user, isLoggedIn, isAuthor, login, register, logout, fetchProfile }
})
