import request from '../utils/request'

export function getEventReview(eventId) {
  return request.get(`/review/${eventId}`)
}
