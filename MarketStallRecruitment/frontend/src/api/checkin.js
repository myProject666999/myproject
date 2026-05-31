import request from '../utils/request'

export function generateCheckInCode(registrationId) {
  return request.post(`/checkin/generate-code/${registrationId}`)
}

export function checkIn(data) {
  return request.post('/checkin', data)
}

export function getCheckInList(eventId) {
  return request.get(`/checkin/event/${eventId}`)
}
