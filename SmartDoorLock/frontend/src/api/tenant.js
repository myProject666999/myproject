import request from '@/utils/request'

export function getTenantPage(params) {
  return request({
    url: '/tenant/page',
    method: 'get',
    params
  })
}

export function getTenantList() {
  return request({
    url: '/tenant/list',
    method: 'get'
  })
}

export function getTenantDetail(id) {
  return request({
    url: `/tenant/${id}`,
    method: 'get'
  })
}

export function addTenant(data) {
  return request({
    url: '/tenant',
    method: 'post',
    data
  })
}

export function updateTenant(data) {
  return request({
    url: '/tenant',
    method: 'put',
    data
  })
}

export function deleteTenant(id) {
  return request({
    url: `/tenant/${id}`,
    method: 'delete'
  })
}
