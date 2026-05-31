import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MicroApp, AppVersion, AppDependency } from '@/types'
import * as appApi from '@/api/app'

export const useAppStore = defineStore('app', () => {
  const apps = ref<MicroApp[]>([])
  const currentApp = ref<MicroApp | null>(null)
  const versions = ref<AppVersion[]>([])
  const dependencies = ref<AppDependency[]>([])
  const loading = ref(false)
  const pagination = ref({
    current: 1,
    size: 10,
    total: 0
  })

  const onlineCount = computed(() => apps.value.filter(a => a.status === 1).length)
  const offlineCount = computed(() => apps.value.filter(a => a.status === 0).length)
  const maintenanceCount = computed(() => apps.value.filter(a => a.status === 2).length)

  async function fetchApps(query?: { keyword?: string; status?: number }) {
    loading.value = true
    try {
      const result = await appApi.getAppList({
        pageNum: pagination.value.current,
        pageSize: pagination.value.size,
        ...query
      }) as any
      if (Array.isArray(result)) {
        apps.value = result
        pagination.value.total = result.length
      } else if (result && result.records) {
        apps.value = result.records
        pagination.value.total = result.total || result.records.length
      }
    } catch (e) {
      console.error('fetchApps error:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchAppDetail(id: number) {
    loading.value = true
    try {
      currentApp.value = await appApi.getAppDetail(id)
    } finally {
      loading.value = false
    }
  }

  async function createApp(data: Partial<MicroApp>) {
    return await appApi.createApp(data)
  }

  async function updateApp(id: number, data: Partial<MicroApp>) {
    return await appApi.updateApp(id, data)
  }

  async function deleteApp(id: number) {
    return await appApi.deleteApp(id)
  }

  async function toggleStatus(id: number, status: number) {
    return await appApi.toggleAppStatus(id, status)
  }

  async function fetchVersions(appId: number) {
    loading.value = true
    try {
      versions.value = await appApi.getAppVersions(appId)
    } finally {
      loading.value = false
    }
  }

  async function publishVersion(appId: number, data: any) {
    return await appApi.publishVersion(appId, data)
  }

  async function fetchDependencies(appId: number) {
    loading.value = true
    try {
      dependencies.value = await appApi.getAppDependencies(appId)
    } finally {
      loading.value = false
    }
  }

  async function addDependency(appId: number, data: Partial<AppDependency>) {
    return await appApi.addDependency(appId, data)
  }

  async function removeDependency(id: number) {
    return await appApi.removeDependency(id)
  }

  function setCurrentApp(app: MicroApp | null) {
    currentApp.value = app
  }

  function setPagination(current: number, size?: number) {
    pagination.value.current = current
    if (size) pagination.value.size = size
  }

  function reset() {
    apps.value = []
    currentApp.value = null
    versions.value = []
    dependencies.value = []
    pagination.value = { current: 1, size: 10, total: 0 }
  }

  return {
    apps,
    currentApp,
    versions,
    dependencies,
    loading,
    pagination,
    onlineCount,
    offlineCount,
    maintenanceCount,
    fetchApps,
    fetchAppDetail,
    createApp,
    updateApp,
    deleteApp,
    toggleStatus,
    fetchVersions,
    publishVersion,
    fetchDependencies,
    addDependency,
    removeDependency,
    setCurrentApp,
    setPagination,
    reset
  }
})
