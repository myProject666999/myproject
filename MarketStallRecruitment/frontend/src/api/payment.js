import request from '../utils/request'

export function createPayment(data) {
  return request.post('/payment', data)
}

export function confirmPayment(paymentNo) {
  return request.post(`/payment/confirm/${paymentNo}`)
}

export function getPaymentList(params) {
  return request.get('/payment/page', { params })
}

export function requestRefund(data) {
  return request.post('/payment/refund', data)
}

export function processRefund(paymentId, approved) {
  return request.post(`/payment/refund/${paymentId}/process`, null, { params: { approved } })
}
