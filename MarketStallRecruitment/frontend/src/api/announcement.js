import request from '../utils/request'

export function getAnnouncementList(params) {
  return request.get('/announcement/page', { params })
}

export function createAnnouncement(data) {
  return request.post('/announcement', data)
}

export function publishAnnouncement(id) {
  return request.put(`/announcement/${id}/publish`)
}

export function revokeAnnouncement(id) {
  return request.put(`/announcement/${id}/revoke`)
}
