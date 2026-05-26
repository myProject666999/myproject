import request from '@/utils/request'

export const createReview = (data) => {
  return request({
    url: '/review/create',
    method: 'post',
    data
  })
}

export const getReviewList = (params) => {
  return request({
    url: '/review/list',
    method: 'get',
    params
  })
}

export const replyReview = (reviewId, reply) => {
  return request({
    url: `/review/${reviewId}/reply`,
    method: 'post',
    data: { reply }
  })
}

export const getOrderReview = (orderId) => {
  return request({
    url: `/review/order/${orderId}`,
    method: 'get'
  })
}
