import request from '@/utils/request'

export function userLogin(data) {
  return request.post('/user/login', data)
}

export function userRegister(data) {
  return request.post('/user/register', data)
}

export function workerLogin(data) {
  return request.post('/worker/login', data)
}

export function workerRegister(data) {
  return request.post('/worker/register', data)
}

export function updateUserProfile(data) {
  return request.put('/user/profile', data)
}
