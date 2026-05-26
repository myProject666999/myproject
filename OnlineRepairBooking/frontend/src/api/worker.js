import request from '@/utils/request'

export const getWorkerList = (params) => {
  return request({
    url: '/workers',
    method: 'get',
    params
  })
}

export const getWorkerDetail = (id) => {
  return request({
    url: `/workers/${id}`,
    method: 'get'
  })
}

export const getWorkerReviews = (workerId, params) => {
  return request({
    url: `/workers/${workerId}/reviews`,
    method: 'get',
    params
  })
}

export const workerRegister = (data) => {
  return request({
    url: '/workers/register',
    method: 'post',
    data
  })
}

export const getWorkerStats = () => {
  return request({
    url: '/worker/stats',
    method: 'get'
  })
}
