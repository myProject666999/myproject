import request from '@/utils/request'

export function getCopyrightList(params) {
  return request({
    url: '/copyright-authorizations',
    method: 'get',
    params
  })
}

export function getCopyrightDetail(id) {
  return request({
    url: `/copyright-authorizations/${id}`,
    method: 'get'
  })
}

export function createCopyright(data) {
  return request({
    url: '/copyright-authorizations',
    method: 'post',
    data
  })
}

export function updateCopyright(id, data) {
  return request({
    url: `/copyright-authorizations/${id}`,
    method: 'put',
    data
  })
}

export function deleteCopyright(id) {
  return request({
    url: `/copyright-authorizations/${id}`,
    method: 'delete'
  })
}

export function revokeAuthorization(id, data) {
  return request({
    url: `/copyright-authorizations/${id}/revoke`,
    method: 'post',
    data
  })
}

export function checkAuthorizationConflict(params) {
  return request({
    url: '/copyright-authorizations/check/conflict',
    method: 'get',
    params
  })
}
