import { defineStore } from 'pinia'
import { login, logout, getUserInfo } from '@/api/user'
import { setToken, getToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: null,
    roles: []
  }),

  actions: {
    async login(userInfo) {
      try {
        const res = await login(userInfo)
        this.token = res.data.token
        setToken(res.data.token)
        return res
      } catch (error) {
        throw error
      }
    },

    async getUserInfo() {
      try {
        const res = await getUserInfo()
        this.userInfo = res.data
        this.roles = res.data.roles || []
        return res
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await logout()
      } finally {
        this.token = ''
        this.userInfo = null
        this.roles = []
        removeToken()
      }
    },

    resetToken() {
      this.token = ''
      removeToken()
    }
  }
})
