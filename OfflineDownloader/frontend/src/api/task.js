import request from './request'

export function addTask(url, title) {
  return request({
    url: '/tasks',
    method: 'post',
    data: { url, title }
  })
}

export function getTaskList(status, page, pageSize) {
  return request({
    url: '/tasks',
    method: 'get',
    params: { status, page, page_size: pageSize }
  })
}

export function getTaskDetail(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'get'
  })
}

export function pauseTask(id) {
  return request({
    url: `/tasks/${id}/pause`,
    method: 'put'
  })
}

export function resumeTask(id) {
  return request({
    url: `/tasks/${id}/resume`,
    method: 'put'
  })
}

export function deleteTask(id, deleteFiles) {
  return request({
    url: `/tasks/${id}`,
    method: 'delete',
    params: { delete_files: deleteFiles }
  })
}

export function pauseAllTasks() {
  return request({
    url: '/tasks/pause-all',
    method: 'put'
  })
}

export function resumeAllTasks() {
  return request({
    url: '/tasks/resume-all',
    method: 'put'
  })
}

export function clearCompletedTasks() {
  return request({
    url: '/tasks/clear-completed',
    method: 'delete'
  })
}

export function getStatistics() {
  return request({
    url: '/statistics',
    method: 'get'
  })
}
