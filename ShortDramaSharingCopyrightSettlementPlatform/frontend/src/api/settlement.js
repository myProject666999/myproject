import request from '@/utils/request'

export function getSettlementList(params) {
  return request({
    url: '/settlements',
    method: 'get',
    params
  })
}

export function getSettlementDetail(id) {
  return request({
    url: `/settlements/${id}`,
    method: 'get'
  })
}

export function createSettlement(data) {
  return request({
    url: '/settlements',
    method: 'post',
    data
  })
}

export function verifySettlement(id) {
  return request({
    url: `/settlements/${id}/verify`,
    method: 'post'
  })
}

export function confirmSettlement(id) {
  return request({
    url: `/settlements/${id}/confirm`,
    method: 'post'
  })
}

export function paySettlement(id) {
  return request({
    url: `/settlements/${id}/paid`,
    method: 'post'
  })
}

export function markSettlementPaid(id) {
  return request({
    url: `/settlements/${id}/paid`,
    method: 'post'
  })
}
