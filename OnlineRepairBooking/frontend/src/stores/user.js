import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, getProfile, logout as logoutApi } from '@/api/user'
import { setToken, getToken, removeToken, setUserInfo, getUserInfo } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const userInfo = ref(getUserInfo())

  const isLoggedIn = computed(() => !!token.value)
  const isWorker = computed(() => userInfo.value?.role === 'worker')

  const login = async (loginForm) => {
    const res = await loginApi(loginForm)
    token.value = res.token
    userInfo.value = res.user
    setToken(res.token)
    setUserInfo(res.user)
    return res
  }

  const register = async (registerForm) => {
    const res = await registerApi(registerForm)
    return res
  }

  const fetchProfile = async () => {
    const res = await getProfile()
    userInfo.value = res
    setUserInfo(res)
    return res
  }

  const updateUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
    setUserInfo(userInfo.value)
  }

  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      token.value = ''
      userInfo.value = null
      removeToken()
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isWorker,
    login,
    register,
    fetchProfile,
    updateUserInfo,
    logout
  }
})
