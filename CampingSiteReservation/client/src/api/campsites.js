import request from '@/utils/request'

export function getCampsites(params = {}) {
  return request.get('/campsites', { params })
}

export function getCampsiteDetail(id) {
  return request.get(`/campsites/${id}`)
}

export function getCampsiteAvailability(id, params) {
  return request.get(`/campsites/${id}/availability`, { params })
}
