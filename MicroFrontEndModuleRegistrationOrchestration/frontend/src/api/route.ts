import { get, post, put, del } from '@/utils/request'
import type { RouteConfig, PageQuery } from '@/types'

export function getRouteTree(appId?: number) {
  return get<RouteConfig[]>('/api/route/list', { appId })
}

export function getRouteList(params?: PageQuery & { appId?: number; parentId?: number; keyword?: string }) {
  return get('/api/route/list', params)
}

export function getRouteDetail(id: number) {
  return get<RouteConfig>(`/api/route/${id}`)
}

export function createRoute(data: Partial<RouteConfig>) {
  return post('/api/route', data)
}

export function updateRoute(id: number, data: Partial<RouteConfig>) {
  return put('/api/route', { ...data, id })
}

export function deleteRoute(id: number) {
  return del(`/api/route/${id}`)
}

export function updateRouteSort(routes: { id: number; sort: number; parentId?: number }[]) {
  return put('/api/route/sort', { routes })
}

export function previewRoutes(appId: number) {
  return get<RouteConfig[]>(`/api/route/list`, { appId })
}

export function getRouteByPath(path: string) {
  return get<RouteConfig>('/api/route/path', { path })
}
