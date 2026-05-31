import request from './request'

export function getPendingAllocation() {
  return request({
    url: '/allocation/pending',
    method: 'get'
  })
}

export function getAllocationSuggestion(containerId) {
  return request({
    url: `/allocation/suggestion/${containerId}`,
    method: 'get'
  })
}

export function autoAllocate(containerId) {
  return request({
    url: `/allocation/auto/${containerId}`,
    method: 'post'
  })
}

export function manualAllocate(data) {
  return request({
    url: '/allocation/manual',
    method: 'post',
    data
  })
}

export function confirmAllocation(data) {
  return request({
    url: '/allocation/confirm',
    method: 'post',
    data
  })
}

export function getAllocationHistory(params) {
  return request({
    url: '/allocation/history',
    method: 'get',
    params
  })
}

export function getRelocationRate() {
  return request({
    url: '/allocation/relocation-rate',
    method: 'get'
  })
}
