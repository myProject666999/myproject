import request from '@/utils/request'

export const createReview = (data) => {
  return request({
    url: '/reviews',
    method: 'post',
    data
  })
}

export const getReviewList = (params) => {
  return request({
    url: '/reviews',
    method: 'get',
    params
  })
}

export const getMyReviews = (params) => {
  return request({
    url: '/reviews/my',
    method: 'get',
    params
  })
}

export const replyReview = (reviewId, replyContent) => {
  return request({
    url: `/reviews/${reviewId}/reply`,
    method: 'post',
    data: { replyContent }
  })
}
