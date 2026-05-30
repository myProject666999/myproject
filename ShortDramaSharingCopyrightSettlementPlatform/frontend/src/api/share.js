import request from '@/utils/request'

export function calculateShare(data) {
  return request({
    url: '/share/calculate',
    method: 'post',
    data
  })
}

export function getCalculationTasks(params) {
  return request({
    url: '/share/tasks',
    method: 'get',
    params
  })
}

export function getShareDetailList(params) {
  return request({
    url: '/share/details',
    method: 'get',
    params
  })
}

export function getShareDetails(taskId) {
  return request({
    url: `/share/details/${taskId}`,
    method: 'get'
  })
}

export function getStakeholderShareDetails(stakeholderId, params) {
  return request({
    url: `/share/stakeholder/${stakeholderId}`,
    method: 'get',
    params
  })
}
