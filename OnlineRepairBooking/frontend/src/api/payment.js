import request from '@/utils/request'

export const createPayment = (data) => {
  return request({
    url: '/payments',
    method: 'post',
    data
  })
}

export const processPayment = (paymentId) => {
  return request({
    url: '/payments/process',
    method: 'post',
    data: { paymentId }
  })
}

export const getPaymentStatus = (id) => {
  return request({
    url: `/payments/${id}`,
    method: 'get'
  })
}
