
import { defineStore } from 'pinia'
import { login, getCurrentUser } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    username: '',
    nickname: '',
    phone: '',
    avatar: '',
    token: '',
    roles: [],
    permissions: [],
    menus: []
  }),

  getters: {
    isLoggedIn: state => !!state.token
  },

  actions: {
    async login(loginForm) {
      const res = await login(loginForm)
      this.setUserInfo(res.data)
      return res
    },

    async getInfo() {
      const res = await getCurrentUser()
      this.setUserInfo(res.data)
      return res
    },

    setUserInfo(data) {
      this.id = data.id
      this.username = data.username
      this.nickname = data.nickname
      this.phone = data.phone
      this.avatar = data.avatar
      this.token = data.token || this.token
      this.roles = data.roles || []
      this.permissions = data.permissions || []
      this.menus = data.menus || []
    },

    logout() {
      this.id = null
      this.username = ''
      this.nickname = ''
      this.phone = ''
      this.avatar = ''
      this.token = ''
      this.roles = []
      this.permissions = []
      this.menus = []
    }
  },

  persist: {
    key: 'user-info',
    paths: ['id', 'username', 'nickname', 'phone', 'avatar', 'token', 'roles', 'permissions', 'menus']
  }
})
