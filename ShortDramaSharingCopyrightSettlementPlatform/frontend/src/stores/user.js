import { defineStore } from 'pinia'
import { login, getCurrentUser } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),
  actions: {
    async login(username, password) {
      try {
        const res = await login({ username, password })
        this.token = res.token
        this.userInfo = {
          user_id: res.user_id,
          username: res.username,
          real_name: res.real_name,
          role: res.role
        }
        localStorage.setItem('token', res.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        ElMessage.success('登录成功')
        return true
      } catch (error) {
        return false
      }
    },
    async fetchUserInfo() {
      try {
        const res = await getCurrentUser()
        this.userInfo = res
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
