import request from '@/utils/request'

export function createCheckinSession(params) {
  return request({
    url: '/checkin',
    method: 'post',
    params
  })
}

export function getCheckinSessionById(id) {
  return request({
    url: `/checkin/${id}`,
    method: 'get'
  })
}

export function getCheckinSessionByToken(token) {
  return request({
    url: `/checkin/token/${token}`,
    method: 'get'
  })
}

export function getCheckinSessionsByTraining(trainingId) {
  return request({
    url: `/checkin/training/${trainingId}`,
    method: 'get'
  })
}

export function getActiveCheckinSessions(trainingId) {
  return request({
    url: `/checkin/training/${trainingId}/active`,
    method: 'get'
  })
}

export function getAllCheckinSessions() {
  return request({
    url: '/checkin',
    method: 'get'
  })
}

export function deactivateCheckinSession(id) {
  return request({
    url: `/checkin/${id}/deactivate`,
    method: 'post'
  })
}

export function deleteCheckinSession(id) {
  return request({
    url: `/checkin/${id}`,
    method: 'delete'
  })
}

export function checkinByQr(data) {
  return request({
    url: '/attendance/checkin-by-qr',
    method: 'post',
    params: data
  })
}

export function manualCheckin(data) {
  return request({
    url: '/attendance/manual-checkin',
    method: 'post',
    params: data
  })
}

export function getAttendanceByTraining(trainingId) {
  return request({
    url: `/attendance/training/${trainingId}`,
    method: 'get'
  })
}

export function getAttendanceByStudent(studentId) {
  return request({
    url: `/attendance/student/${studentId}`,
    method: 'get'
  })
}

export function getAttendanceList(params) {
  return request({
    url: '/attendance',
    method: 'get',
    params
  })
}

export function getAttendanceStatistics(trainingId) {
  return request({
    url: `/attendance/statistics/${trainingId}`,
    method: 'get'
  })
}

export function deleteAttendance(id) {
  return request({
    url: `/attendance/${id}`,
    method: 'delete'
  })
}
