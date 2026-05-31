import request from '../utils/request'

export function getAreaList(params) {
  return request.get('/areas', { params })
}

export function getArea(id) {
  return request.get(`/areas/${id}`)
}

export function createArea(data) {
  return request.post('/areas', data)
}

export function updateArea(id, data) {
  return request.put(`/areas/${id}`, data)
}

export function deleteArea(id) {
  return request.delete(`/areas/${id}`)
}
