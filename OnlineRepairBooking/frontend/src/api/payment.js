import request from '@/utils/request'

export const createPayment = (orderId, paymentMethod) => {
  return request({
    url: '/payment/create',
    method: 'post',
    data: { orderId, paymentMethod }
  })
}

export const processPayment = (paymentId) => {
  return request({
    url: `/payment/${paymentId}/process`,
    method: 'post'
  })
}

export const getPaymentStatus = (paymentId) => {
  return request({
    url: `/payment/${paymentId}/status`,
    method: 'get'
  })
}

export const getOrderPayment = (orderId) => {
  return request({
    url: `/payment/order/${orderId}`,
    method: 'get'
  })
}
