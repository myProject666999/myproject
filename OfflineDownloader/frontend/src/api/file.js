import request from './request'

export function getFileList(type, keyword, page, pageSize) {
  return request({
    url: '/files',
    method: 'get',
    params: { type, keyword, page, page_size: pageSize }
  })
}

export function getFileDetail(id) {
  return request({
    url: `/files/${id}`,
    method: 'get'
  })
}

export function deleteFile(id, deleteFromDisk) {
  return request({
    url: `/files/${id}`,
    method: 'delete',
    params: { delete_from_disk: deleteFromDisk }
  })
}

export function getFilesByTaskId(taskId) {
  return request({
    url: `/files/task/${taskId}`,
    method: 'get'
  })
}

export function getFileStatistics() {
  return request({
    url: '/files/statistics',
    method: 'get'
  })
}

export function scanDirectory() {
  return request({
    url: '/files/scan',
    method: 'post'
  })
}

export function getPlayUrl(id) {
  return `/api/files/${id}/play`
}

export function getDownloadUrl(id) {
  return `/api/files/${id}/download`
}

export function getThumbnailUrl(id) {
  return `/api/files/${id}/thumbnail`
}
