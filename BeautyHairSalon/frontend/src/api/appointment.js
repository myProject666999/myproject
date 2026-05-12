
import request from '@/utils/request'

export function getAppointmentPage(params) {
  return request({
    url: '/appointment/page',
    method: 'get',
    params
  })
}

export function getAppointmentById(id) {
  return request({
    url: `/appointment/${id}`,
    method: 'get'
  })
}

export function addAppointment(data) {
  return request({
    url: '/appointment',
    method: 'post',
    data
  })
}

export function updateAppointment(data) {
  return request({
    url: '/appointment',
    method: 'put',
    data
  })
}

export function updateAppointmentStatus(id, status) {
  return request({
    url: `/appointment/status/${id}/${status}`,
    method: 'put'
  })
}

export function deleteAppointment(id) {
  return request({
    url: `/appointment/${id}`,
    method: 'delete'
  })
}

export function getAppointmentSchedule(params) {
  return request({
    url: '/appointment/schedule',
    method: 'get',
    params
  })
}

export function getTechnicians() {
  return request({
    url: '/appointment/technicians',
    method: 'get'
  })
}

export function getAppointmentStatistics() {
  return request({
    url: '/appointment/statistics',
    method: 'get'
  })
}
