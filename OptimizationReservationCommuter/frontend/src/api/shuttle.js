import request from '../utils/request'

export function getShuttleList(params) {
  return request({
    url: '/shuttles',
    method: 'get',
    params
  })
}

export function getShuttle(id) {
  return request({
    url: `/shuttles/${id}`,
    method: 'get'
  })
}

export function createShuttle(data) {
  return request({
    url: '/shuttles',
    method: 'post',
    data
  })
}

export function updateShuttle(id, data) {
  return request({
    url: `/shuttles/${id}`,
    method: 'put',
    data
  })
}

export function deleteShuttle(id) {
  return request({
    url: `/shuttles/${id}`,
    method: 'delete'
  })
}
