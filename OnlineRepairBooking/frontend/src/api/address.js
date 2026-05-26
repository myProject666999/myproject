import request from '@/utils/request'

export const getAddressList = () => {
  return request({
    url: '/address/list',
    method: 'get'
  })
}

export const createAddress = (data) => {
  return request({
    url: '/address/create',
    method: 'post',
    data
  })
}

export const updateAddress = (id, data) => {
  return request({
    url: `/address/${id}`,
    method: 'put',
    data
  })
}

export const deleteAddress = (id) => {
  return request({
    url: `/address/${id}`,
    method: 'delete'
  })
}

export const setDefaultAddress = (id) => {
  return request({
    url: `/address/${id}/default`,
    method: 'post'
  })
}

export const getDefaultAddress = () => {
  return request({
    url: '/address/default',
    method: 'get'
  })
}
