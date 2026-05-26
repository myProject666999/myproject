import request from '@/utils/request'

export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export const register = (data) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

export const getProfile = () => {
  return request({
    url: '/user/profile',
    method: 'get'
  })
}

export const updateProfile = (data) => {
  return request({
    url: '/user/profile',
    method: 'put',
    data
  })
}

export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
