import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, getProfile } from '@/api/rider'

export const useRiderStore = defineStore('rider', () => {
  const token = ref<string | null>(localStorage.getItem('rider_token'))
  const riderInfo = ref<any>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function handleLogin(loginName: string, password: string) {
    const res = await login(loginName, password)
    token.value = res.token
    riderInfo.value = res.rider
    localStorage.setItem('rider_token', res.token)
    return res
  }

  async function handleRegister(data: any) {
    return await register(data)
  }

  async function fetchProfile() {
    if (token.value) {
      try {
        riderInfo.value = await getProfile()
      } catch (error) {
        logout()
      }
    }
  }

  function logout() {
    token.value = null
    riderInfo.value = null
    localStorage.removeItem('rider_token')
  }

  return {
    token,
    riderInfo,
    isLoggedIn,
    handleLogin,
    handleRegister,
    fetchProfile,
    logout
  }
})
