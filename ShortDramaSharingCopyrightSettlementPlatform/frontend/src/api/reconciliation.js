import request from '@/utils/request'

export function getReconciliationList(params) {
  return request({
    url: '/reconciliations',
    method: 'get',
    params
  })
}

export function getReconciliationDetail(id) {
  return request({
    url: `/reconciliations/${id}`,
    method: 'get'
  })
}

export function createReconciliation(data) {
  return request({
    url: '/reconciliations',
    method: 'post',
    data
  })
}

export function processReconciliation(id) {
  return request({
    url: `/reconciliations/${id}/process`,
    method: 'post'
  })
}

export function resolveDiscrepancy(id, data) {
  return request({
    url: `/reconciliations/${id}/resolve`,
    method: 'post',
    data
  })
}

export function adjustReconciliation(id, data) {
  return request({
    url: `/reconciliations/${id}/adjust`,
    method: 'post',
    data
  })
}
