import request from '../utils/request'

export function getOptimizationList(params) {
  return request({
    url: '/optimization',
    method: 'get',
    params
  })
}

export function generateOptimization() {
  return request({
    url: '/optimization/generate',
    method: 'post'
  })
}

export function handleOptimization(id, data) {
  return request({
    url: `/optimization/${id}/handle`,
    method: 'post',
    data
  })
}
