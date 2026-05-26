import request from '@/utils/request'

export const createOrder = (data) => {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

export const getOrderList = (params) => {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

export const getOrderDetail = (id) => {
  return request({
    url: `/order/${id}`,
    method: 'get'
  })
}

export const cancelOrder = (id, reason) => {
  return request({
    url: `/order/${id}/cancel`,
    method: 'post',
    data: { reason }
  })
}

export const grabOrder = (id) => {
  return request({
    url: `/order/${id}/grab`,
    method: 'post'
  })
}

export const acceptOrder = (id) => {
  return request({
    url: `/order/${id}/accept`,
    method: 'post'
  })
}

export const startService = (id) => {
  return request({
    url: `/order/${id}/start`,
    method: 'post'
  })
}

export const completeService = (id, data) => {
  return request({
    url: `/order/${id}/complete`,
    method: 'post',
    data
  })
}

export const getPendingOrders = (params) => {
  return request({
    url: '/order/pending',
    method: 'get',
    params
  })
}

export const getWorkerOrders = (params) => {
  return request({
    url: '/order/worker',
    method: 'get',
    params
  })
}
