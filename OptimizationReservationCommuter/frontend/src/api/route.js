import request from '../utils/request'

export function getRouteList(params) {
  return request({
    url: '/routes',
    method: 'get',
    params
  })
}

export function getRoute(id) {
  return request({
    url: `/routes/${id}`,
    method: 'get'
  })
}

export function createRoute(data) {
  return request({
    url: '/routes',
    method: 'post',
    data
  })
}

export function updateRoute(id, data) {
  return request({
    url: `/routes/${id}`,
    method: 'put',
    data
  })
}

export function deleteRoute(id) {
  return request({
    url: `/routes/${id}`,
    method: 'delete'
  })
}

export function getRouteMap() {
  return request({
    url: '/routes/map',
    method: 'get'
  })
}
