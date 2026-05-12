import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userId: localStorage.getItem('userId') || '',
    username: localStorage.getItem('username') || '',
    name: localStorage.getItem('name') || '',
    role: localStorage.getItem('role') || '',
    clinicId: localStorage.getItem('clinicId') || ''
  }),
  actions: {
    setUser(data) {
      this.token = data.token
      this.userId = data.userId
      this.username = data.username
      this.name = data.name
      this.role = data.role
      this.clinicId = data.clinicId
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('username', data.username)
      localStorage.setItem('name', data.name)
      localStorage.setItem('role', data.role)
      localStorage.setItem('clinicId', data.clinicId)
    },
    logout() {
      this.token = ''
      this.userId = ''
      this.username = ''
      this.name = ''
      this.role = ''
      this.clinicId = ''
      
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('name')
      localStorage.removeItem('role')
      localStorage.removeItem('clinicId')
    }
  }
})
