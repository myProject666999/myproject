import { get, post, put, del } from '@/utils/request'
import type { RouteConfig, PageQuery } from '@/types'

export function getRouteTree(appId?: number) {
  return get<RouteConfig[]>('/route/tree', { appId })
}

export function getRouteList(params?: PageQuery & { appId?: number; parentId?: number }) {
  return get('/route/list', params)
}

export function getRouteDetail(id: number) {
  return get<RouteConfig>(`/route/${id}`)
}

export function createRoute(data: Partial<RouteConfig>) {
  return post('/route', data)
}

export function updateRoute(id: number, data: Partial<RouteConfig>) {
  return put(`/route/${id}`, data)
}

export function deleteRoute(id: number) {
  return del(`/route/${id}`)
}

export function updateRouteSort(routes: { id: number; sort: number; parentId?: number }[]) {
  return put('/route/sort', { routes })
}

export function previewRoutes(appId: number) {
  return get<RouteConfig[]>(`/route/preview/${appId}`)
}

export function getRouteByPath(path: string) {
  return get<RouteConfig>('/route/path', { path })
}
