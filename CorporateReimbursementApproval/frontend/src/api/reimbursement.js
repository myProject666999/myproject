import request from '@/utils/request'

export function createReimbursement(data) {
  return request({
    url: '/reimbursement/create',
    method: 'post',
    data
  })
}

export function updateReimbursement(id, data) {
  return request({
    url: `/reimbursement/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteReimbursement(id) {
  return request({
    url: `/reimbursement/delete/${id}`,
    method: 'delete'
  })
}

export function submitReimbursement(id) {
  return request({
    url: `/reimbursement/submit/${id}`,
    method: 'post'
  })
}

export function getMyReimbursements(params) {
  return request({
    url: '/reimbursement/my',
    method: 'get',
    params
  })
}

export function getDetail(id) {
  return request({
    url: `/reimbursement/detail/${id}`,
    method: 'get'
  })
}