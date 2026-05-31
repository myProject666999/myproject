import request from './request'

export function getOperationLogList(params) {
  return request({
    url: '/log/operation/list',
    method: 'get',
    params
  })
}

export function getSystemLogList(params) {
  return request({
    url: '/log/system/list',
    method: 'get',
    params
  })
}

export function getContainerLog(containerId) {
  return request({
    url: `/log/container/${containerId}`,
    method: 'get'
  })
}

export function exportLog(params) {
  return request({
    url: '/log/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
