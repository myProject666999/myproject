import request from '../utils/request'

export function login(username, password) {
  return request.post('/user/login', { username, password })
}
