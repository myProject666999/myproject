import request from '../utils/request'

export function getScheduleList(params) {
  return request({
    url: '/schedules',
    method: 'get',
    params
  })
}

export function getSchedule(id) {
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

export function updateSchedule(id, data) {
  return request({
    url: `/schedules/${id}`,
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
