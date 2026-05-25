import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null') || {
      id: null,
      username: '',
      realName: '',
      employeeNo: '',
      deptId: null,
      roles: []
    }
  }),

  actions: {
    async login(username, password) {
      const res = await loginApi(username, password)
      if (res.code === 200) {
        this.token = res.data.token
        localStorage.setItem('token', res.data.token)
        if (res.data.userInfo) {
          this.setUserInfo(res.data.userInfo)
        }
      }
      return res
    },

    async logout() {
      try {
        await logoutApi()
      } finally {
        this.token = ''
        this.userInfo = {
          id: null,
          username: '',
          realName: '',
          employeeNo: '',
          deptId: null,
          roles: []
        }
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
      }
    },

    setUserInfo(info) {
      this.userInfo = {
        id: info.id,
        username: info.username,
        realName: info.realName,
        employeeNo: info.employeeNo,
        deptId: info.deptId,
        roles: info.roles || []
      }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },

    async fetchUserInfo() {
      const res = await getUserInfo()
      if (res.code === 200 && res.data) {
        this.setUserInfo(res.data)
      }
      return res
    }
  }
})
