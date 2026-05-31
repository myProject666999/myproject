import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'light' | 'dark'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(false)
  const theme = ref<Theme>('light')
  const loading = ref<boolean>(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setLoading(bool: boolean) {
    loading.value = bool
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
  }

  return {
    sidebarCollapsed,
    theme,
    loading,
    toggleSidebar,
    setLoading,
    setTheme
  }
})
