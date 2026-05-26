import request from '@/utils/request'

export const getAddressList = () => {
  return request({
    url: '/user/addresses',
    method: 'get'
  })
}

export const createAddress = (data) => {
  return request({
    url: '/user/addresses',
    method: 'post',
    data
  })
}

export const updateAddress = (id, data) => {
  return request({
    url: `/user/addresses/${id}`,
    method: 'put',
    data
  })
}

export const deleteAddress = (id) => {
  return request({
    url: `/user/addresses/${id}`,
    method: 'delete'
  })
}

export const setDefaultAddress = (id) => {
  return request({
    url: `/user/addresses/${id}/default`,
    method: 'post'
  })
}
