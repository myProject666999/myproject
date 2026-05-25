import request from '@/utils/request'

export function login(data) {
  return request.post('/login', data)
}

export function getUserInfo() {
  return request.get('/user/info')
}

export function getUserList(params) {
  return request.get('/user/list', { params })
}

export function createUser(data) {
  return request.post('/user', data)
}

export function updateUser(data) {
  return request.put('/user', data)
}

export function deleteUser(id) {
  return request.delete(`/user/${id}`)
}

export function getAgentList() {
  return request.get('/user/agents')
}
