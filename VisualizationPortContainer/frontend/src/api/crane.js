import request from './request'

export function getCraneList(params) {
  return request({
    url: '/crane/list',
    method: 'get',
    params
  })
}

export function getCraneDetail(id) {
  return request({
    url: `/crane/${id}`,
    method: 'get'
  })
}

export function getCraneStatus() {
  return request({
    url: '/crane/status',
    method: 'get'
  })
}

export function updateCraneStatus(id, data) {
  return request({
    url: `/crane/${id}/status`,
    method: 'put',
    data
  })
}

export function getCraneUtilization(params) {
  return request({
    url: '/crane/utilization',
    method: 'get',
    params
  })
}

export function getCraneTaskQueue(craneId) {
  return request({
    url: `/crane/${craneId}/tasks`,
    method: 'get'
  })
}
