import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, getProfile } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => user.value?.role || '')
  const name = computed(() => user.value?.name || '')

  const login = async (username, password) => {
    const result = await apiLogin({ username, password })
    token.value = result.token
    user.value = result.user
    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user))
    return result
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const refreshProfile = async () => {
    const result = await getProfile()
    user.value = result
    localStorage.setItem('user', JSON.stringify(result))
  }

  return {
    token,
    user,
    isLoggedIn,
    role,
    name,
    login,
    logout,
    refreshProfile
  }
})
