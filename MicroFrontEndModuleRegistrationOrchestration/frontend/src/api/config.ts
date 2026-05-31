import { get, post, put, del } from '@/utils/request'
import type { RuntimeConfig, ConfigPublish, PageQuery } from '@/types'

export function getConfigList(params?: PageQuery & { scope?: string; appId?: number; status?: number; keyword?: string }) {
  return get('/api/config/list', params)
}

export function getConfigDetail(id: number) {
  return get<RuntimeConfig>(`/api/config/${id}`)
}

export function createConfig(data: Partial<RuntimeConfig>) {
  return post('/api/config', data)
}

export function updateConfig(id: number, data: Partial<RuntimeConfig>) {
  return put('/api/config', { ...data, id })
}

export function deleteConfig(id: number) {
  return del(`/api/config/${id}`)
}

export function publishConfig(data: any) {
  return post('/api/config/publish', data)
}

export function getPublishHistory(params?: PageQuery & { status?: number }) {
  return get('/api/config/page', params)
}

export function getPublishDetail(id: number) {
  return get<ConfigPublish>(`/api/config/${id}`)
}

export function cancelPublish(id: number) {
  return put(`/api/config/status/${id}`, { status: 3 })
}

export function rollbackPublish(id: number) {
  return put(`/api/config/status/${id}`, { status: 4 })
}

export function getConfigByKey(key: string, scope: string, appId?: number) {
  return get<RuntimeConfig>('/api/config/key', { configKey: key, appCode: scope === 'global' ? undefined : scope })
}

export function batchUpdateConfigs(configs: Partial<RuntimeConfig>[]) {
  return put('/api/config/batch', { configs })
}
