import { get, post, put, del } from '@/utils/request'
import type { GrayRelease, GrayUser, PageQuery } from '@/types'

export function getGrayList(params?: PageQuery & { status?: number; appId?: number }) {
  return get('/gray/list', params)
}

export function getGrayDetail(id: number) {
  return get<GrayRelease>(`/gray/${id}`)
}

export function createGray(data: any) {
  return post('/gray', data)
}

export function updateGray(id: number, data: Partial<GrayRelease>) {
  return put(`/gray/${id}`, data)
}

export function deleteGray(id: number) {
  return del(`/gray/${id}`)
}

export function startGray(id: number) {
  return put(`/gray/${id}/start`)
}

export function pauseGray(id: number) {
  return put(`/gray/${id}/pause`)
}

export function fullGray(id: number) {
  return put(`/gray/${id}/full`)
}

export function rollbackGray(id: number) {
  return put(`/gray/${id}/rollback`)
}

export function getGrayUsers(grayId: number, params?: PageQuery) {
  return get(`/gray/${grayId}/users`, params)
}

export function addGrayUsers(grayId: number, userIds: string[]) {
  return post(`/gray/${grayId}/users`, { userIds })
}

export function removeGrayUser(id: number) {
  return del(`/gray/user/${id}`)
}

export function getGrayStatistics(id: number) {
  return get(`/gray/${id}/statistics`)
}

export function updateGrayRule(id: number, ruleConfig: string) {
  return put(`/gray/${id}/rule`, { ruleConfig })
}
