import request from '@/utils/request'

export function getTrainingList(params) {
  return request({
    url: '/training',
    method: 'get',
    params
  })
}

export function getTrainingById(id) {
  return request({
    url: `/training/${id}`,
    method: 'get'
  })
}

export function getOngoingTrainings() {
  return request({
    url: '/training/ongoing',
    method: 'get'
  })
}

export function getEndedTrainings() {
  return request({
    url: '/training/ended',
    method: 'get'
  })
}

export function getUpcomingTrainings() {
  return request({
    url: '/training/upcoming',
    method: 'get'
  })
}

export function createTraining(data) {
  return request({
    url: '/training',
    method: 'post',
    data
  })
}

export function updateTraining(data) {
  return request({
    url: '/training',
    method: 'put',
    data
  })
}

export function deleteTraining(id) {
  return request({
    url: `/training/${id}`,
    method: 'delete'
  })
}

export function generateTrainingQrcode(id) {
  return request({
    url: `/training/${id}/qrcode`,
    method: 'post'
  })
}

export function batchGenerateCertificates(trainingId) {
  return request({
    url: `/training/${trainingId}/certificates/batch`,
    method: 'post'
  })
}

export function getAttendanceReport(trainingId) {
  return request({
    url: `/training/${trainingId}/attendance/report`,
    method: 'get'
  })
}

export function exportAttendanceReport(trainingId) {
  return request({
    url: `/training/${trainingId}/attendance/export`,
    method: 'get',
    responseType: 'blob'
  })
}
