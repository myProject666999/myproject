import request from '@/utils/request'

export function getStakeholderTypes() {
  return request({
    url: '/stakeholders/types',
    method: 'get'
  })
}

export function getStakeholderList(params) {
  return request({
    url: '/stakeholders',
    method: 'get',
    params
  })
}

export function getStakeholderDetail(id) {
  return request({
    url: `/stakeholders/${id}`,
    method: 'get'
  })
}

export function createStakeholder(data) {
  return request({
    url: '/stakeholders',
    method: 'post',
    data
  })
}

export function updateStakeholder(id, data) {
  return request({
    url: `/stakeholders/${id}`,
    method: 'put',
    data
  })
}

export function deleteStakeholder(id) {
  return request({
    url: `/stakeholders/${id}`,
    method: 'delete'
  })
}
