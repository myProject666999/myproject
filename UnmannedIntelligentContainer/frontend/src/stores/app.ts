import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(false)
  const loadingCount = ref<number>(0)
  const isMobile = ref<boolean>(false)

  const isLoading = computed<boolean>(() => loadingCount.value > 0)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  function startLoading() {
    loadingCount.value++
  }

  function stopLoading() {
    if (loadingCount.value > 0) {
      loadingCount.value--
    }
  }

  function resetLoading() {
    loadingCount.value = 0
  }

  function setIsMobile(value: boolean) {
    isMobile.value = value
  }

  return {
    sidebarCollapsed,
    loadingCount,
    isMobile,
    isLoading,
    toggleSidebar,
    setSidebarCollapsed,
    startLoading,
    stopLoading,
    resetLoading,
    setIsMobile
  }
})
