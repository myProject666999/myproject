import request from '@/utils/request'

export function getPendingApprovals(params) {
  return request({
    url: '/approval/pending',
    method: 'get',
    params
  })
}

export function approve(id, opinion) {
  return request({
    url: `/approval/approve/${id}`,
    method: 'post',
    data: { opinion }
  })
}

export function reject(id, opinion) {
  return request({
    url: `/approval/reject/${id}`,
    method: 'post',
    data: { opinion }
  })
}

export function getRecords(id) {
  return request({
    url: `/approval/records/${id}`,
    method: 'get'
  })
}

export function getMyRecords(params) {
  return request({
    url: '/approval/my-records',
    method: 'get',
    params
  })
}

export function getStats() {
  return request({
    url: '/approval/stats',
    method: 'get'
  })
}