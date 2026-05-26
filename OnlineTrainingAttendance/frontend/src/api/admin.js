import request from '@/utils/request'

export function adminLogin(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

export function getAdminList(params) {
  return request({
    url: '/admin',
    method: 'get',
    params
  })
}

export function getAdminById(id) {
  return request({
    url: `/admin/${id}`,
    method: 'get'
  })
}

export function createAdmin(data) {
  return request({
    url: '/admin',
    method: 'post',
    data
  })
}

export function updateAdmin(data) {
  return request({
    url: '/admin',
    method: 'put',
    data
  })
}

export function deleteAdmin(id) {
  return request({
    url: `/admin/${id}`,
    method: 'delete'
  })
}
