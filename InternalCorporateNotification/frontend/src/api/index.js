import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

export function getUserInfo() {
  return request({
    url: '/auth/user-info',
    method: 'get'
  })
}

export function getAnnouncements(params) {
  return request({
    url: '/announcements',
    method: 'get',
    params
  })
}

export function getAnnouncement(id) {
  return request({
    url: `/announcements/${id}`,
    method: 'get'
  })
}

export function publishAnnouncement(data) {
  return request({
    url: '/announcements',
    method: 'post',
    data
  })
}

export function updateAnnouncement(id, data) {
  return request({
    url: `/announcements/${id}`,
    method: 'put',
    data
  })
}

export function deleteAnnouncement(id) {
  return request({
    url: `/announcements/${id}`,
    method: 'delete'
  })
}

export function updatePriority(id, priority) {
  return request({
    url: `/announcements/${id}/priority`,
    method: 'put',
    params: { priority }
  })
}

export function getUnreadCount() {
  return request({
    url: '/announcements/unread-count',
    method: 'get'
  })
}

export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export function addCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

export function updateCategory(id, data) {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}

export function getDepartmentTree() {
  return request({
    url: '/departments/tree',
    method: 'get'
  })
}

export function getDepartments() {
  return request({
    url: '/departments',
    method: 'get'
  })
}

export function uploadAttachment(file, announcementId) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('announcementId', announcementId)
  return request({
    url: '/attachments/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getAttachments(announcementId) {
  return request({
    url: `/attachments/announcement/${announcementId}`,
    method: 'get'
  })
}

export function deleteAttachment(id) {
  return request({
    url: `/attachments/${id}`,
    method: 'delete'
  })
}

export function getComments(announcementId) {
  return request({
    url: `/comments/announcement/${announcementId}`,
    method: 'get'
  })
}

export function addComment(data) {
  return request({
    url: '/comments',
    method: 'post',
    data
  })
}

export function deleteComment(id) {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  })
}

export function getReadStatistics(announcementId) {
  return request({
    url: `/statistics/announcement/${announcementId}`,
    method: 'get'
  })
}

export function getMyStats() {
  return request({
    url: '/statistics/my-stats',
    method: 'get'
  })
}
