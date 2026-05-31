import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userId = ref(null)
  const username = ref('')
  const role = ref('')
  const realName = ref('')

  function login(data) {
    token.value = data.token
    userId.value = data.userId
    username.value = data.username
    role.value = data.role
    realName.value = data.realName

    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role', data.role)
    localStorage.setItem('realName', data.realName)
  }

  function logout() {
    token.value = ''
    userId.value = null
    username.value = ''
    role.value = ''
    realName.value = ''

    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('realName')
  }

  function loadFromStorage() {
    token.value = localStorage.getItem('token') || ''
    userId.value = localStorage.getItem('userId') || null
    username.value = localStorage.getItem('username') || ''
    role.value = localStorage.getItem('role') || ''
    realName.value = localStorage.getItem('realName') || ''
  }

  return {
    token,
    userId,
    username,
    role,
    realName,
    login,
    logout,
    loadFromStorage
  }
})
