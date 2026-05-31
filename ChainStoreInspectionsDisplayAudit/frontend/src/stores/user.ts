import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/models'
import { auth } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(auth.getToken())
  const userInfo = ref<User | null>(auth.getCurrentUser())
  const isLoggedIn = ref<boolean>(auth.isLoggedIn())
  const roles = ref<string[]>(userInfo.value ? [userInfo.value.role] : [])

  const isAdmin = computed(() => roles.value.includes('admin'))
  const isInspector = computed(() => roles.value.includes('admin') || roles.value.includes('manager') || roles.value.includes('inspector'))
  const isManager = computed(() => roles.value.includes('admin') || roles.value.includes('manager'))

  function login(user: User, userToken: string) {
    token.value = userToken
    userInfo.value = user
    isLoggedIn.value = true
    roles.value = [user.role]
  }

  function logout() {
    token.value = null
    userInfo.value = null
    isLoggedIn.value = false
    roles.value = []
    auth.logout()
  }

  function updateUserInfo(user: User) {
    userInfo.value = user
    roles.value = [user.role]
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    roles,
    isAdmin,
    isInspector,
    isManager,
    login,
    logout,
    updateUserInfo
  }
})
