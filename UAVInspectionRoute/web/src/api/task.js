import request from '../utils/request'

export function getTaskList(params) {
  return request.get('/tasks', { params })
}

export function getTask(id) {
  return request.get(`/tasks/${id}`)
}

export function createTask(data) {
  return request.post('/tasks', data)
}

export function updateTask(id, data) {
  return request.put(`/tasks/${id}`, data)
}

export function deleteTask(id) {
  return request.delete(`/tasks/${id}`)
}

export function startTask(id) {
  return request.post(`/tasks/${id}/start`)
}

export function pauseTask(id) {
  return request.post(`/tasks/${id}/pause`)
}

export function resumeTask(id) {
  return request.post(`/tasks/${id}/resume`)
}

export function completeTask(id) {
  return request.post(`/tasks/${id}/complete`)
}

export function cancelTask(id) {
  return request.post(`/tasks/${id}/cancel`)
}
