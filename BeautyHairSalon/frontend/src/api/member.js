
import request from '@/utils/request'

export function getMemberPage(params) {
  return request({
    url: '/member/page',
    method: 'get',
    params
  })
}

export function getMemberById(id) {
  return request({
    url: `/member/${id}`,
    method: 'get'
  })
}

export function getMemberByPhone(phone) {
  return request({
    url: `/member/phone/${phone}`,
    method: 'get'
  })
}

export function addMember(data) {
  return request({
    url: '/member',
    method: 'post',
    data
  })
}

export function updateMember(data) {
  return request({
    url: '/member',
    method: 'put',
    data
  })
}

export function deleteMember(id) {
  return request({
    url: `/member/${id}`,
    method: 'delete'
  })
}

export function getMemberStatistics() {
  return request({
    url: '/member/statistics',
    method: 'get'
  })
}
