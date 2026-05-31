import request from '../utils/request'

export function getStallsByEvent(eventId) {
  return request.get(`/stall/event/${eventId}`)
}

export function getStallMap(eventId) {
  return request.get(`/stall/event/${eventId}/map`)
}

export function createStall(data) {
  return request.post('/stall', data)
}

export function batchCreateStalls(data) {
  return request.post('/stall/batch', data)
}

export function updateStall(id, data) {
  return request.put(`/stall/${id}`, data)
}

export function deleteStall(id) {
  return request.delete(`/stall/${id}`)
}

export function selectStall(data) {
  return request.post('/stall-selection/select', data)
}

export function releaseExpired() {
  return request.post('/stall-selection/release-expired')
}
