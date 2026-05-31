import request from '../utils/request'

export function getNoFlyZoneList(params) {
  return request.get('/no-fly-zones', { params })
}

export function getNoFlyZone(id) {
  return request.get(`/no-fly-zones/${id}`)
}

export function createNoFlyZone(data) {
  return request.post('/no-fly-zones', data)
}

export function updateNoFlyZone(id, data) {
  return request.put(`/no-fly-zones/${id}`, data)
}

export function deleteNoFlyZone(id) {
  return request.delete(`/no-fly-zones/${id}`)
}
