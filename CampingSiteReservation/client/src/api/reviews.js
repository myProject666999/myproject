import request from '@/utils/request'

export function getReviews(params = {}) {
  return request.get('/reviews', { params })
}

export function getReviewDetail(id) {
  return request.get(`/reviews/${id}`)
}

export function createReview(data) {
  return request.post('/reviews', data)
}

export function getCampsiteReviews(campsiteId, params = {}) {
  return request.get(`/campsites/${campsiteId}/reviews`, { params })
}
