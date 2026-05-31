import request from '../utils/request'

export function getMediaList(params) {
  return request.get('/media', { params })
}

export function getMedia(id) {
  return request.get(`/media/${id}`)
}

export function deleteMedia(id) {
  return request.delete(`/media/${id}`)
}

export function initChunkUpload(data) {
  return request.post('/media/upload/init', data)
}

export function uploadChunk(data, onProgress) {
  return request.post('/media/upload/chunk', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  })
}

export function mergeChunks(data) {
  return request.post('/media/upload/merge', data)
}
