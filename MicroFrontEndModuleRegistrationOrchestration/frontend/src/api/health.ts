import { get, post, put, del } from '@/utils/request'
import type { HealthCheck, HealthCheckHistory, PageQuery } from '@/types'

export function getHealthList(params?: PageQuery & { healthStatus?: number; keyword?: string }) {
  return get('/api/health/list', params)
}

export function getHealthDetail(id: number) {
  return get<HealthCheck>(`/api/health/${id}`)
}

export function createHealth(data: Partial<HealthCheck>) {
  return post('/api/health', data)
}

export function updateHealth(id: number, data: Partial<HealthCheck>) {
  return put('/api/health', { ...data, id })
}

export function deleteHealth(id: number) {
  return del(`/api/health/${id}`)
}

export function triggerCheck(id: number) {
  return post(`/api/health/check/${id}`)
}

export function triggerAllCheck() {
  return post('/api/health/check')
}

export function getHealthHistory(appId: number, params?: PageQuery) {
  return get(`/api/health/history/${appId}`, params)
}

export function getHealthSummary() {
  return get<{
    total: number
    healthy: number
    unhealthy: number
    unknown: number
  }>('/api/health/summary')
}

export function getHealthTrend(checkId?: number, hours: number = 24) {
  return get<{
    times: string[]
    healthyCounts: number[]
    unhealthyCounts: number[]
    avgResponseTimes: number[]
  }>('/api/health/trend', { checkId, hours })
}

export function toggleAutoOffline(id: number, enabled: number) {
  return post(`/api/health/status/${id}`, { status: enabled })
}
