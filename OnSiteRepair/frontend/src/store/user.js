import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const userType = ref(parseInt(localStorage.getItem('userType') || '0'))

  const isLoggedIn = computed(() => !!token.value)

  function setLogin(data) {
    token.value = data.token
    userInfo.value = {
      id: data.id,
      phone: data.phone,
      nickname: data.nickname,
      avatar: data.avatar
    }
    userType.value = data.userType

    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    localStorage.setItem('userType', data.userType)
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    userType.value = 0
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userType')
  }

  function updateUserInfo(info) {
    userInfo.value = { ...userInfo.value, ...info }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  return {
    token,
    userInfo,
    userType,
    isLoggedIn,
    setLogin,
    logout,
    updateUserInfo
  }
})
