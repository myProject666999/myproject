import request from '../utils/request'

export function getRouteList(params) {
  return request.get('/routes', { params })
}

export function getRoute(id) {
  return request.get(`/routes/${id}`)
}

export function createRoute(data) {
  return request.post('/routes', data)
}

export function updateRoute(id, data) {
  return request.put(`/routes/${id}`, data)
}

export function deleteRoute(id) {
  return request.delete(`/routes/${id}`)
}

export function getRoutePoints(routeId) {
  return request.get(`/routes/${routeId}/points`)
}

export function updateRoutePoints(routeId, data) {
  return request.put(`/routes/${routeId}/points`, data)
}

export function checkNoFlyZoneConflict(data) {
  return request.post('/routes/check-no-fly-zone', data)
}
