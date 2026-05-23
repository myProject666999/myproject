import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 1
  },
  actions: {
    async login(loginForm) {
      const res = await request.post('/user/login', loginForm)
      this.token = res.data.token
      this.userInfo = res.data
      localStorage.setItem('token', this.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      return res.data
    },
    async register(registerForm) {
      const res = await request.post('/user/register', registerForm)
      this.token = res.data.token
      this.userInfo = res.data
      localStorage.setItem('token', this.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      return res.data
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
