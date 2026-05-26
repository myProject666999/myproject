import request from '@/utils/request'

export const getWorkerList = (params) => {
  return request({
    url: '/worker/list',
    method: 'get',
    params
  })
}

export const getWorkerDetail = (id) => {
  return request({
    url: `/worker/${id}`,
    method: 'get'
  })
}

export const getWorkerReviews = (workerId, params) => {
  return request({
    url: `/worker/${workerId}/reviews`,
    method: 'get',
    params
  })
}

export const getWorkerStats = (workerId) => {
  return request({
    url: `/worker/${workerId}/stats`,
    method: 'get'
  })
}
