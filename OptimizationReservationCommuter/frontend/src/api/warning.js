import request from '../utils/request'

export function getWarningList(params) {
  return request({
    url: '/warnings',
    method: 'get',
    params
  })
}

export function getWarningStats() {
  return request({
    url: '/warnings/stats',
    method: 'get'
  })
}

export function handleWarning(id, data) {
  return request({
    url: `/warnings/${id}/handle`,
    method: 'post',
    data
  })
}
