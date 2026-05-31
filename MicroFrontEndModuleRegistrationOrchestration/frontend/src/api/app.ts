import { get, post, put, del } from '@/utils/request'
import type { MicroApp, AppVersion, AppDependency, PageQuery } from '@/types'

export function getAppList(params?: PageQuery & { status?: number; keyword?: string }) {
  return get('/api/app/list', params)
}

export function getAppDetail(id: number) {
  return get<MicroApp>(`/api/app/${id}`)
}

export function createApp(data: Partial<MicroApp>) {
  return post('/api/app', data)
}

export function updateApp(id: number, data: Partial<MicroApp>) {
  return put(`/api/app`, { ...data, id })
}

export function deleteApp(id: number) {
  return del(`/api/app/${id}`)
}

export function toggleAppStatus(id: number, status: number) {
  if (status === 1) {
    return post(`/api/app/online/${id}`)
  } else {
    return post(`/api/app/offline/${id}`)
  }
}

export function getAppVersions(appId: number) {
  return get<AppVersion[]>(`/api/app/version/list/${appId}`)
}

export function publishVersion(appId: number, data: any) {
  return post('/api/app/version', { ...data, appId })
}

export function getAppDependencies(appId: number) {
  return get<AppDependency[]>(`/api/dependency/app/${appId}`)
}

export function addDependency(appId: number, data: Partial<AppDependency>) {
  return post('/api/dependency', data)
}

export function removeDependency(id: number) {
  return del(`/api/dependency/${id}`)
}

export function getAllApps() {
  return get<MicroApp[]>('/api/app/list', { pageNum: 1, pageSize: 1000 })
}
