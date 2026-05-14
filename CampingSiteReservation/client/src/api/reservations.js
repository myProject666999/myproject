import request from '@/utils/request'

export function createReservation(data) {
  return request.post('/reservations', data)
}

export function getReservations(params = {}) {
  return request.get('/reservations', { params })
}

export function getReservationDetail(id) {
  return request.get(`/reservations/${id}`)
}

export function updateReservation(id, data) {
  return request.put(`/reservations/${id}`, data)
}

export function cancelReservation(id) {
  return request.post(`/reservations/${id}/cancel`)
}

export function checkinReservation(id, data = {}) {
  return request.post(`/reservations/${id}/checkin`, data)
}

export function checkoutReservation(id, data = {}) {
  return request.post(`/reservations/${id}/checkout`, data)
}
