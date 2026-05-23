import { defineStore } from 'pinia'
import { login, register, getCurrentUser } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),
  
  actions: {
    async loginAction(loginForm) {
      const res = await login(loginForm)
      this.token = res.data.token
      localStorage.setItem('token', res.data.token)
      this.userInfo = res.data
      return res.data
    },
    
    async registerAction(registerForm) {
      const res = await register(registerForm)
      this.token = res.data.token
      localStorage.setItem('token', res.data.token)
      this.userInfo = res.data
      return res.data
    },
    
    async getCurrentUserAction() {
      try {
        const res = await getCurrentUser()
        this.userInfo = res.data
        return res.data
      } catch (e) {
        this.logout()
        throw e
      }
    },
    
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    }
  }
})
