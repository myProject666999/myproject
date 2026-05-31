import { get, post, put, del } from '@/utils/request'
import type { GrayRelease, GrayUser, PageQuery } from '@/types'

export function getGrayList(params?: PageQuery & { status?: number; appId?: number; keyword?: string }) {
  return get('/api/gray/page', params)
}

export function getGrayDetail(id: number) {
  return get<GrayRelease>(`/api/gray/${id}`)
}

export function createGray(data: any) {
  return post('/api/gray', data)
}

export function updateGray(id: number, data: Partial<GrayRelease>) {
  return put('/api/gray', { ...data, id })
}

export function deleteGray(id: number) {
  return del(`/api/gray/${id}`)
}

export function startGray(id: number) {
  return post(`/api/gray/start/${id}`)
}

export function pauseGray(id: number) {
  return post(`/api/gray/pause/${id}`)
}

export function fullGray(id: number) {
  return post(`/api/gray/full/${id}`)
}

export function rollbackGray(id: number) {
  return post(`/api/gray/rollback/${id}`)
}

export function getGrayUsers(grayId: number, params?: PageQuery) {
  return get(`/api/gray/${grayId}/users`, params)
}

export function addGrayUsers(grayId: number, userIds: string[]) {
  return post(`/api/gray/${grayId}/users`, { userIds })
}

export function removeGrayUser(id: number) {
  return del(`/api/gray/user/${id}`)
}

export function getGrayStatistics(id: number) {
  return get(`/api/gray/${id}`)
}

export function updateGrayRule(id: number, ruleConfig: string) {
  return put('/api/gray', { id, ruleConfig })
}
