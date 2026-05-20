import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getCurrentUser } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const login = async (loginData) => {
    const res = await loginApi(loginData)
    token.value = res.token
    userInfo.value = {
      id: res.id,
      username: res.username,
      nickname: res.nickname,
      avatar: res.avatar
    }
    localStorage.setItem('token', res.token)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    return res
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const fetchCurrentUser = async () => {
    try {
      const res = await getCurrentUser()
      userInfo.value = res
      localStorage.setItem('userInfo', JSON.stringify(res))
      return res
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    token,
    userInfo,
    login,
    logout,
    fetchCurrentUser
  }
})
