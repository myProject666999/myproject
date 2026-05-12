import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, getProfile } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<any>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function handleLogin(login: string, password: string) {
    const res = await login(login, password)
    token.value = res.token
    userInfo.value = res.user
    localStorage.setItem('token', res.token)
    return res
  }

  async function handleRegister(username: string, password: string, phone: string, nickname: string) {
    return await register(username, password, phone, nickname)
  }

  async function fetchProfile() {
    if (token.value) {
      try {
        userInfo.value = await getProfile()
      } catch (error) {
        logout()
      }
    }
  }

  function logout() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    handleLogin,
    handleRegister,
    fetchProfile,
    logout
  }
})
