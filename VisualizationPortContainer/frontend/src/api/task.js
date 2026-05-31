import request from './request'

export function getTaskList(params) {
  return request({
    url: '/task/list',
    method: 'get',
    params
  })
}

export function getTaskDetail(id) {
  return request({
    url: `/task/${id}`,
    method: 'get'
  })
}

export function createTask(data) {
  return request({
    url: '/task',
    method: 'post',
    data
  })
}

export function updateTask(id, data) {
  return request({
    url: `/task/${id}`,
    method: 'put',
    data
  })
}

export function assignTask(id, data) {
  return request({
    url: `/task/${id}/assign`,
    method: 'put',
    data
  })
}

export function completeTask(id) {
  return request({
    url: `/task/${id}/complete`,
    method: 'put'
  })
}

export function getPendingTasks() {
  return request({
    url: '/task/pending',
    method: 'get'
  })
}

export function getTaskQueue() {
  return request({
    url: '/task/queue',
    method: 'get'
  })
}

export function getTaskGantt(params) {
  return request({
    url: '/task/gantt',
    method: 'get',
    params
  })
}
