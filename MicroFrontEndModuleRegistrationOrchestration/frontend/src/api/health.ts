import { get, post, put, del } from '@/utils/request'
import type { HealthCheck, HealthCheckHistory, PageQuery } from '@/types'

export function getHealthList(params?: PageQuery & { healthStatus?: number }) {
  return get('/health/list', params)
}

export function getHealthDetail(id: number) {
  return get<HealthCheck>(`/health/${id}`)
}

export function createHealth(data: Partial<HealthCheck>) {
  return post('/health', data)
}

export function updateHealth(id: number, data: Partial<HealthCheck>) {
  return put(`/health/${id}`, data)
}

export function deleteHealth(id: number) {
  return del(`/health/${id}`)
}

export function triggerCheck(id: number) {
  return post(`/health/${id}/check`)
}

export function triggerAllCheck() {
  return post('/health/check/all')
}

export function getHealthHistory(checkId: number, params?: PageQuery) {
  return get(`/health/${checkId}/history`, params)
}

export function getHealthSummary() {
  return get<{
    total: number
    healthy: number
    unhealthy: number
    unknown: number
  }>('/health/summary')
}

export function getHealthTrend(checkId?: number, hours: number = 24) {
  return get<{
    times: string[]
    healthyCounts: number[]
    unhealthyCounts: number[]
    avgResponseTimes: number[]
  }>('/health/trend', { checkId, hours })
}

export function toggleAutoOffline(id: number, enabled: number) {
  return put(`/health/${id}/auto-offline`, { enabled })
}

export function batchTriggerCheck(ids: number[]) {
  return post('/health/check/batch', { ids })
}
