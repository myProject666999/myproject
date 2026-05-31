import request from './request'

export function getSlotList(params) {
  return request({
    url: '/slot/list',
    method: 'get',
    params
  })
}

export function getSlotDetail(id) {
  return request({
    url: `/slot/${id}`,
    method: 'get'
  })
}

export function getSlotByPosition(params) {
  return request({
    url: '/slot/position',
    method: 'get',
    params
  })
}

export function updateSlotStatus(id, data) {
  return request({
    url: `/slot/${id}/status`,
    method: 'put',
    data
  })
}

export function getSlotOccupancy(yardId) {
  return request({
    url: `/slot/occupancy/${yardId}`,
    method: 'get'
  })
}
