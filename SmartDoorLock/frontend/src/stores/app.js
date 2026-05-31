import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const loading = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = collapsed
  }

  function setLoading(isLoading) {
    loading.value = isLoading
  }

  return {
    sidebarCollapsed,
    loading,
    toggleSidebar,
    setSidebarCollapsed,
    setLoading
  }
})
