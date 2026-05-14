import request from '@/utils/request'

export function getActivities(params = {}) {
  return request.get('/activities', { params })
}

export function getActivityDetail(id) {
  return request.get(`/activities/${id}`)
}
