import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isLogin: false
  }),
  actions: {
    setUserInfo(info) {
      this.userInfo = info
      this.isLogin = true
      localStorage.setItem('userInfo', JSON.stringify(info))
    },
    logout() {
      this.userInfo = null
      this.isLogin = false
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
    },
    restoreLogin() {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo)
        this.isLogin = true
      }
    }
  }
})
