import request from '../utils/request'

export function getComparisonList(params) {
  return request.get('/comparisons', { params })
}

export function getComparison(id) {
  return request.get(`/comparisons/${id}`)
}

export function createComparison(data) {
  return request.post('/comparisons', data)
}

export function deleteComparison(id) {
  return request.delete(`/comparisons/${id}`)
}

export function runComparison(data) {
  return request.post('/comparisons/compare', data)
}
