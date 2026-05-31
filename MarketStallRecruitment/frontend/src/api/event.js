import request from '../utils/request'

export function getEventList(params) {
  return request.get('/event/page', { params })
}

export function getEventDetail(id) {
  return request.get(`/event/${id}`)
}

export function createEvent(data) {
  return request.post('/event', data)
}

export function updateEvent(id, data) {
  return request.put(`/event/${id}`, data)
}

export function deleteEvent(id) {
  return request.delete(`/event/${id}`)
}

export function updateEventStatus(id, status) {
  return request.put(`/event/${id}/status`, null, { params: { status } })
}
