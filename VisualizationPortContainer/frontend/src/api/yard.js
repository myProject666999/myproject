import request from './request'

export function getYardList(params) {
  return request({
    url: '/yard/list',
    method: 'get',
    params
  })
}

export function getYardDetail(id) {
  return request({
    url: `/yard/${id}`,
    method: 'get'
  })
}

export function getYardStatistics() {
  return request({
    url: '/yard/statistics',
    method: 'get'
  })
}

export function getYardLayout(yardId) {
  return request({
    url: `/yard/${yardId}/layout`,
    method: 'get'
  })
}
