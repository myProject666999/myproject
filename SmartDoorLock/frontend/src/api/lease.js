import request from '@/utils/request'

export function getLeasePage(params) {
  return request({
    url: '/lease-contract/page',
    method: 'get',
    params
  })
}

export function getLeaseDetail(id) {
  return request({
    url: `/lease-contract/${id}`,
    method: 'get'
  })
}

export function createLease(data) {
  return request({
    url: '/lease-contract',
    method: 'post',
    data
  })
}

export function updateLease(data) {
  return request({
    url: '/lease-contract',
    method: 'put',
    data
  })
}

export function terminateLease(id, reason) {
  return request({
    url: `/lease-contract/${id}/terminate`,
    method: 'put',
    params: { reason }
  })
}

export function checkInLease(id, checkInDate) {
  return request({
    url: `/lease-contract/${id}/check-in`,
    method: 'put',
    params: { checkInDate }
  })
}
