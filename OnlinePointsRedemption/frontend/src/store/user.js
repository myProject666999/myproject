import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo } from '@/api'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)

  const mockUsers = {
    1: { id: 1, username: 'admin', nickname: '超级管理员', points: 10000, available: 10000 },
    2: { id: 2, username: 'user001', nickname: '张三', points: 5000, available: 5000 },
    3: { id: 3, username: 'user002', nickname: '李四', points: 3000, available: 3000 },
    4: { id: 4, username: 'user003', nickname: '王五', points: 8000, available: 8000 },
    5: { id: 5, username: 'user004', nickname: '赵六', points: 1500, available: 1500 }
  }

  async function loadUserInfo() {
    try {
      const res = await getUserInfo()
      if (res?.code === 0 && res.data) {
        currentUser.value = res.data
      } else {
        currentUser.value = mockUsers[2]
      }
    } catch {
      currentUser.value = mockUsers[2]
    }
  }

  function switchUser(userId) {
    currentUser.value = mockUsers[userId] || mockUsers[2]
  }

  function getCurrentUserId() {
    return currentUser.value?.id || 2
  }

  return {
    currentUser,
    loadUserInfo,
    switchUser,
    getCurrentUserId
  }
})
