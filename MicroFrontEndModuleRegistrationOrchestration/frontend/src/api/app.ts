import { get, post, put, del } from '@/utils/request'
import type { MicroApp, AppVersion, AppDependency, PageQuery } from '@/types'

export function getAppList(params?: PageQuery & { status?: number }) {
  return get('/app/list', params)
}

export function getAppDetail(id: number) {
  return get<MicroApp>(`/app/${id}`)
}

export function createApp(data: Partial<MicroApp>) {
  return post('/app', data)
}

export function updateApp(id: number, data: Partial<MicroApp>) {
  return put(`/app/${id}`, data)
}

export function deleteApp(id: number) {
  return del(`/app/${id}`)
}

export function toggleAppStatus(id: number, status: number) {
  return put(`/app/${id}/status`, { status })
}

export function getAppVersions(appId: number) {
  return get<AppVersion[]>(`/app/${appId}/versions`)
}

export function publishVersion(appId: number, data: any) {
  return post(`/app/${appId}/version`, data)
}

export function getAppDependencies(appId: number) {
  return get<AppDependency[]>(`/app/${appId}/dependencies`)
}

export function addDependency(appId: number, data: Partial<AppDependency>) {
  return post(`/app/${appId}/dependency`, data)
}

export function removeDependency(id: number) {
  return del(`/app/dependency/${id}`)
}

export function getAllApps() {
  return get<MicroApp[]>('/app/all')
}
