import request from '@/utils/request'

export function getLockPage(params) {
  return request({
    url: '/door-lock/page',
    method: 'get',
    params
  })
}

export function getLockList() {
  return request({
    url: '/door-lock/list',
    method: 'get'
  })
}

export function getLockDetail(id) {
  return request({
    url: `/door-lock/${id}`,
    method: 'get'
  })
}

export function addLock(data) {
  return request({
    url: '/door-lock',
    method: 'post',
    data
  })
}

export function updateLock(data) {
  return request({
    url: '/door-lock',
    method: 'put',
    data
  })
}

export function deleteLock(id) {
  return request({
    url: `/door-lock/${id}`,
    method: 'delete'
  })
}
