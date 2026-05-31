import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login } from '../api/auth'
import { setToken, setUserInfo, clearAuth, getToken, getUserInfo } from '../utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '')
  const userInfo = ref(getUserInfo() || null)

  const handleLogin = async (loginData) => {
    try {
      const res = await login(loginData)
      token.value = res.token
      userInfo.value = res.user || res.employee
      setToken(res.token)
      setUserInfo(res.user || res.employee)
      return res
    } catch (error) {
      throw error
    }
  }

  const handleLogout = () => {
    token.value = ''
    userInfo.value = null
    clearAuth()
  }

  return {
    token,
    userInfo,
    handleLogin,
    handleLogout
  }
})
