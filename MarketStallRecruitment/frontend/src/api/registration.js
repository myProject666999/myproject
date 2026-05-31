import request from '../utils/request'

export function submitRegistration(data) {
  return request.post('/registration', data)
}

export function getRegistrationList(params) {
  return request.get('/registration/page', { params })
}

export function getRegistrationDetail(id) {
  return request.get(`/registration/${id}`)
}

export function auditRegistration(data) {
  return request.post('/registration/audit', data)
}

export function cancelRegistration(id) {
  return request.post(`/registration/${id}/cancel`)
}
