import { get, post, put, del } from '@/utils/request'
import type { RuntimeConfig, ConfigPublish, PageQuery } from '@/types'

export function getConfigList(params?: PageQuery & { scope?: string; appId?: number; status?: number }) {
  return get('/config/list', params)
}

export function getConfigDetail(id: number) {
  return get<RuntimeConfig>(`/config/${id}`)
}

export function createConfig(data: Partial<RuntimeConfig>) {
  return post('/config', data)
}

export function updateConfig(id: number, data: Partial<RuntimeConfig>) {
  return put(`/config/${id}`, data)
}

export function deleteConfig(id: number) {
  return del(`/config/${id}`)
}

export function publishConfig(data: {
  publishType: string
  scope: string
  appId?: number
  configIds?: number[]
}) {
  return post('/config/publish', data)
}

export function getPublishHistory(params?: PageQuery & { status?: number }) {
  return get('/config/publish/history', params)
}

export function getPublishDetail(id: number) {
  return get<ConfigPublish>(`/config/publish/${id}`)
}

export function cancelPublish(id: number) {
  return put(`/config/publish/${id}/cancel`)
}

export function rollbackPublish(id: number) {
  return put(`/config/publish/${id}/rollback`)
}

export function getConfigByKey(key: string, scope: string, appId?: number) {
  return get<RuntimeConfig>('/config/key', { key, scope, appId })
}

export function batchUpdateConfigs(configs: Partial<RuntimeConfig>[]) {
  return put('/config/batch', { configs })
}
