import request from '@/utils/request'

export function getPendingReviewOrders() {
  return request({
    url: '/review/pending',
    method: 'get'
  })
}

export function submitReview(data) {
  return request({
    url: '/review/review',
    method: 'post',
    data
  })
}

export function getReviewRecords(orderId) {
  return request({
    url: `/review/records/${orderId}`,
    method: 'get'
  })
}
