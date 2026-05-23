import request from './request'

export const uploadVideo = (formData, onProgress) =>
  request.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  })

export const initChunkUpload = (data) =>
  request.post('/videos/chunk/init', data)

export const uploadChunk = (formData) =>
  request.post('/videos/chunk/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const completeChunkUpload = (data) =>
  request.post('/videos/chunk/complete', data)

export const getVideoDetail = (id) =>
  request.get(`/videos/${id}`)

export const getVideoPlaySign = (id) =>
  request.get(`/videos/${id}/play-sign`)
