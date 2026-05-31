import request from '@/utils/request'

export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

export function updateOrder(data) {
  return request({
    url: '/order/update',
    method: 'post',
    data
  })
}

export function submitForReview(orderId) {
  return request({
    url: `/order/submit/${orderId}`,
    method: 'post'
  })
}

export function cancelOrder(orderId) {
  return request({
    url: `/order/cancel/${orderId}`,
    method: 'post'
  })
}

export function getOrderList(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

export function getOrderDetail(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'get'
  })
}

export function getOrderSqlList(orderId) {
  return request({
    url: `/order/${orderId}/sql`,
    method: 'get'
  })
}

export function getOrderRisks(orderId) {
  return request({
    url: `/order/${orderId}/risks`,
    method: 'get'
  })
}
