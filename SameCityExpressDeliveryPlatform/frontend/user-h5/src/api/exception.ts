import request from './request'

export function createException(data: any) {
  return request.post('/user/exception', data)
}

export function getExceptions(params: any = {}) {
  return request.get('/user/exception', { params })
}

export function getExceptionDetail(id: number) {
  return request.get(`/user/exception/${id}`)
}
