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
