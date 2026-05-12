import request from './request'

export function login(login: string, password: string) {
  return request.post('/auth/user/login', { login, password })
}

export function register(username: string, password: string, phone: string, nickname: string) {
  return request.post('/auth/user/register', { username, password, phone, nickname })
}

export function getProfile() {
  return request.get('/user/profile')
}

export function updateProfile(data: any) {
  return request.put('/user/profile', data)
}

export function changePassword(oldPassword: string, newPassword: string) {
  return request.post('/user/change-password', { old_password: oldPassword, new_password: newPassword })
}
