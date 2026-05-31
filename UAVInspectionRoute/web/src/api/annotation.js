import request from '../utils/request'

export function getAnnotationList(params) {
  return request.get('/annotations', { params })
}

export function getAnnotation(id) {
  return request.get(`/annotations/${id}`)
}

export function createAnnotation(data) {
  return request.post('/annotations', data)
}

export function updateAnnotation(id, data) {
  return request.put(`/annotations/${id}`, data)
}

export function deleteAnnotation(id) {
  return request.delete(`/annotations/${id}`)
}
