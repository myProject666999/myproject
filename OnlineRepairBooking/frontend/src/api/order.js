import request from '@/utils/request'

export const createOrder = (data) => {
  return request({
    url: '/orders',
    method: 'post',
    data
  })
}

export const getOrderList = (params) => {
  return request({
    url: '/orders',
    method: 'get',
    params
  })
}

export const getOrderDetail = (id) => {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  })
}

export const cancelOrder = (id, cancelReason) => {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'post',
    data: { cancelReason }
  })
}

export const grabOrder = (id) => {
  return request({
    url: `/worker/orders/${id}/grab`,
    method: 'post'
  })
}

export const acceptOrder = (id) => {
  return request({
    url: `/worker/orders/${id}/accept`,
    method: 'post'
  })
}

export const startService = (id) => {
  return request({
    url: `/worker/orders/${id}/start`,
    method: 'post'
  })
}

export const completeService = (id) => {
  return request({
    url: `/worker/orders/${id}/complete`,
    method: 'post'
  })
}

export const getPendingOrders = (params) => {
  return request({
    url: '/worker/orders/pending',
    method: 'get',
    params
  })
}

export const getWorkerOrders = (params) => {
  return request({
    url: '/worker/orders',
    method: 'get',
    params
  })
}
