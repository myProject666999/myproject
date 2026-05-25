import { defineStore } from 'pinia'
import { login, getUserInfo } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),

  actions: {
    async loginAction(username, password) {
      const res = await login(username, password)
      if (res.code === 0) {
        this.token = res.data.token
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify({
          user_id: res.data.user_id,
          username: res.data.username,
          real_name: res.data.real_name,
          role: res.data.role
        }))
        this.userInfo = {
          user_id: res.data.user_id,
          username: res.data.username,
          real_name: res.data.real_name,
          role: res.data.role
        }
      }
      return res
    },

    async fetchUserInfo() {
      const res = await getUserInfo()
      if (res.code === 0) {
        this.userInfo = res.data
        localStorage.setItem('userInfo', JSON.stringify(res.data))
      }
      return res
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
