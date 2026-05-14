import request from '@/utils/request'

export function login(data) {
  return request.post('/users/login', data)
}

export function register(data) {
  return request.post('/users/register', data)
}

export function getUserInfo() {
  return request.get('/users/me')
}

export function updateUserInfo(data) {
  return request.put('/users/me', data)
}
