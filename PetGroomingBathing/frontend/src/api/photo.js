import request from '@/utils/request'

export const getPhotos = (appointmentId) => {
  return request.get('/photos', { params: { appointmentId } })
}

export const getPhoto = (id) => {
  return request.get(`/photos/${id}`)
}

export const createPhoto = (data) => {
  return request.post('/photos', data)
}

export const uploadPhoto = (file, appointmentId, type) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('appointmentId', appointmentId)
  formData.append('type', type)
  return request.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const deletePhoto = (id) => {
  return request.delete(`/photos/${id}`)
}
