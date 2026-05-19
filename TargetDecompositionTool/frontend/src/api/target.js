import request from '@/utils/request'

export function getTargetList() {
  return request({
    url: '/target/list',
    method: 'get'
  })
}

export function getTargetTree() {
  return request({
    url: '/target/tree',
    method: 'get'
  })
}

export function getTargetDetail(id) {
  return request({
    url: `/target/${id}`,
    method: 'get'
  })
}

export function addTarget(data) {
  return request({
    url: '/target',
    method: 'post',
    data
  })
}

export function updateTarget(id, data) {
  return request({
    url: `/target/${id}`,
    method: 'put',
    data
  })
}

export function deleteTarget(id) {
  return request({
    url: `/target/${id}`,
    method: 'delete'
  })
}

export function getMilestoneList(targetId) {
  return request({
    url: `/milestone/target/${targetId}`,
    method: 'get'
  })
}

export function addMilestone(data) {
  return request({
    url: '/milestone',
    method: 'post',
    data
  })
}

export function updateMilestone(id, data) {
  return request({
    url: `/milestone/${id}`,
    method: 'put',
    data
  })
}

export function deleteMilestone(id) {
  return request({
    url: `/milestone/${id}`,
    method: 'delete'
  })
}

export function getReviewList(targetId) {
  const url = targetId ? `/review/target/${targetId}` : '/review'
  return request({
    url,
    method: 'get'
  })
}

export function addReview(data) {
  return request({
    url: '/review',
    method: 'post',
    data
  })
}
