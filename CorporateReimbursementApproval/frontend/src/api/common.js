import request from '@/utils/request'

export function getReimbursementTypes() {
  return request({
    url: '/common/reimbursement-types',
    method: 'get'
  })
}

export function getDepartments() {
  return request({
    url: '/common/departments',
    method: 'get'
  })
}

export function getUsers() {
  return request({
    url: '/common/users',
    method: 'get'
  })
}

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}