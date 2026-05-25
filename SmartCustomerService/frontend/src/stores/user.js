import { defineStore } from 'pinia'
import { login, getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userId: (state) => state.userInfo.id || 0,
    username: (state) => state.userInfo.username || '',
    userRole: (state) => state.userInfo.role || 0
  },
  actions: {
    async loginAction(loginForm) {
      const res = await login(loginForm)
      if (res.code === 0) {
        this.token = res.data.accessToken
        this.userInfo = res.data.userInfo
        localStorage.setItem('token', res.data.accessToken)
        localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
        return true
      }
      return false
    },
    async fetchUserInfo() {
      const res = await getUserInfo()
      if (res.code === 0) {
        this.userInfo = res.data
        localStorage.setItem('userInfo', JSON.stringify(res.data))
      }
    },
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
