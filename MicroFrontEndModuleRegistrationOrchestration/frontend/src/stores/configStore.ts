import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RuntimeConfig, ConfigPublish, PageQuery, PageResult } from '@/types'
import * as configApi from '@/api/config'
import { subscribe } from '@/utils/websocket'

export const useConfigStore = defineStore('config', () => {
  const configs = ref<RuntimeConfig[]>([])
  const publishHistory = ref<ConfigPublish[]>([])
  const loading = ref(false)
  const currentScope = ref<'global' | 'app'>('global')
  const currentAppId = ref<number | null>(null)
  const pagination = ref({
    current: 1,
    size: 10,
    total: 0
  })
  const publishPagination = ref({
    current: 1,
    size: 10,
    total: 0
  })

  const enabledCount = computed(() => configs.value.filter(c => c.status === 1).length)
  const disabledCount = computed(() => configs.value.filter(c => c.status === 0).length)
  const pendingCount = computed(() => configs.value.filter(c => c.status === 2).length)

  async function fetchConfigs(query?: PageQuery & { scope?: string; appId?: number }) {
    loading.value = true
    try {
      const params = {
        current: pagination.value.current,
        size: pagination.value.size,
        scope: currentScope.value,
        appId: currentScope.value === 'app' ? currentAppId.value : undefined,
        ...query
      }
      const result = await configApi.getConfigList(params) as PageResult<RuntimeConfig>
      configs.value = result.records
      pagination.value.total = result.total
      pagination.value.current = result.current
      pagination.value.size = result.size
    } finally {
      loading.value = false
    }
  }

  async function fetchConfigDetail(id: number) {
    return await configApi.getConfigDetail(id)
  }

  async function createConfig(data: Partial<RuntimeConfig>) {
    return await configApi.createConfig(data)
  }

  async function updateConfig(id: number, data: Partial<RuntimeConfig>) {
    return await configApi.updateConfig(id, data)
  }

  async function deleteConfig(id: number) {
    return await configApi.deleteConfig(id)
  }

  async function publishConfig(data: any) {
    return await configApi.publishConfig(data)
  }

  async function fetchPublishHistory(query?: PageQuery) {
    loading.value = true
    try {
      const result = await configApi.getPublishHistory({
        current: publishPagination.value.current,
        size: publishPagination.value.size,
        ...query
      }) as PageResult<ConfigPublish>
      publishHistory.value = result.records
      publishPagination.value.total = result.total
      publishPagination.value.current = result.current
      publishPagination.value.size = result.size
    } finally {
      loading.value = false
    }
  }

  async function getPublishDetail(id: number) {
    return await configApi.getPublishDetail(id)
  }

  function setScope(scope: 'global' | 'app', appId?: number) {
    currentScope.value = scope
    if (appId) currentAppId.value = appId
    pagination.value.current = 1
  }

  function setPagination(current: number, size?: number) {
    pagination.value.current = current
    if (size) pagination.value.size = size
  }

  function setPublishPagination(current: number, size?: number) {
    publishPagination.value.current = current
    if (size) publishPagination.value.size = size
  }

  function handleWebSocketMessage(message: any) {
    if (message.type === 'CONFIG_CHANGED') {
      fetchConfigs()
    } else if (message.type === 'PUBLISH_PROGRESS') {
      const idx = publishHistory.value.findIndex(p => p.id === message.data.id)
      if (idx !== -1) {
        publishHistory.value[idx].progress = message.data.progress
        publishHistory.value[idx].status = message.data.status
      }
    }
  }

  function initWebSocketListener() {
    return subscribe('/topic/config', handleWebSocketMessage)
  }

  function reset() {
    configs.value = []
    publishHistory.value = []
    currentScope.value = 'global'
    currentAppId.value = null
    pagination.value = { current: 1, size: 10, total: 0 }
    publishPagination.value = { current: 1, size: 10, total: 0 }
  }

  return {
    configs,
    publishHistory,
    loading,
    currentScope,
    currentAppId,
    pagination,
    publishPagination,
    enabledCount,
    disabledCount,
    pendingCount,
    fetchConfigs,
    fetchConfigDetail,
    createConfig,
    updateConfig,
    deleteConfig,
    publishConfig,
    fetchPublishHistory,
    getPublishDetail,
    setScope,
    setPagination,
    setPublishPagination,
    initWebSocketListener,
    reset
  }
})
