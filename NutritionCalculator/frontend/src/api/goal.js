import request from './request'

export function getCurrentGoal() {
  return request({
    url: '/nutrition-goals/current',
    method: 'get'
  })
}

export function saveOrUpdateGoal(data) {
  return request({
    url: '/nutrition-goals',
    method: 'post',
    data
  })
}
