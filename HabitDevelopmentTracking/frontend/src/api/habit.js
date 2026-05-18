import request from './request'

export function getTodayHabits() {
  return request({
    url: '/api/habits/today',
    method: 'get'
  })
}

export function getHabits() {
  return request({
    url: '/api/habits',
    method: 'get'
  })
}

export function checkin(habitId, remark) {
  return request({
    url: `/api/habits/${habitId}/checkin`,
    method: 'post',
    data: { remark }
  })
}

export function cancelCheckin(habitId) {
  return request({
    url: `/api/habits/${habitId}/checkin`,
    method: 'delete'
  })
}

export function getHeatmap(year, month) {
  return request({
    url: '/api/habits/heatmap',
    method: 'get',
    params: { year, month }
  })
}

export function getRanking() {
  return request({
    url: '/api/habits/ranking',
    method: 'get'
  })
}

export function getStats() {
  return request({
    url: '/api/habits/stats',
    method: 'get'
  })
}

export function createHabit(data) {
  return request({
    url: '/api/habits',
    method: 'post',
    data
  })
}

export function deleteHabit(id) {
  return request({
    url: `/api/habits/${id}`,
    method: 'delete'
  })
}
