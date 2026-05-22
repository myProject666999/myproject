import request from '@/utils/request'

export function getSchedules() {
  return request({
    url: '/schedules',
    method: 'get'
  })
}

export function getSchedulesByUser(userId) {
  return request({
    url: `/schedules/user/${userId}`,
    method: 'get'
  })
}

export function getTodaySchedulesByUser(userId) {
  return request({
    url: `/schedules/today/${userId}`,
    method: 'get'
  })
}

export function getScheduleById(id) {
  return request({
    url: `/schedules/${id}`,
    method: 'get'
  })
}

export function createSchedule(data) {
  return request({
    url: '/schedules',
    method: 'post',
    data
  })
}

export function updateSchedule(data) {
  return request({
    url: '/schedules',
    method: 'put',
    data
  })
}

export function deleteSchedule(id) {
  return request({
    url: `/schedules/${id}`,
    method: 'delete'
  })
}
