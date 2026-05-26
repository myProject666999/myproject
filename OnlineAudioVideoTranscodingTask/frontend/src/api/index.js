import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

export function uploadFile(file, outputFormat) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('output_format', outputFormat)
  return request.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function getTaskList(params) {
  return request.get('/tasks', { params })
}

export function getTask(id) {
  return request.get(`/tasks/${id}`)
}

export function deleteTask(id) {
  return request.delete(`/tasks/${id}`)
}

export function downloadTask(id) {
  window.open(`/api/tasks/${id}/download`, '_blank')
}
