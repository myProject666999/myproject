import request from './request'

export function login(login: string, password: string) {
  return request.post('/auth/rider/login', { login, password })
}

export function register(data: any) {
  return request.post('/auth/rider/register', data)
}

export function getProfile() {
  return request.get('/rider/profile')
}

export function updateLocation(longitude: number, latitude: number) {
  return request.post('/rider/update-location', { longitude, latitude })
}

export function updateOnlineStatus(status: number) {
  return request.post('/rider/online-status', { status })
}
