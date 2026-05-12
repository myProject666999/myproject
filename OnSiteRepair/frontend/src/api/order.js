import request from '@/utils/request'

export function createOrder(data) {
  return request.post('/order/create', data)
}

export function getUserOrders(status) {
  return request.get('/order/user/list', { params: { status } })
}

export function getWorkerOrders(status) {
  return request.get('/order/worker/list', { params: { status } })
}

export function getOrderDetail(id) {
  return request.get(`/order/${id}`)
}

export function grabOrder(orderId) {
  return request.post(`/order/grab/${orderId}`)
}

export function addPartsList(orderId, data) {
  return request.post(`/order/parts/${orderId}`, null, { params: data })
}

export function negotiatePrice(orderId, data) {
  return request.post(`/order/negotiate/${orderId}`, null, { params: data })
}

export function confirmNegotiation(orderId) {
  return request.post(`/order/negotiate/confirm/${orderId}`)
}

export function completeOrder(orderId, data) {
  return request.post(`/order/complete/${orderId}`, null, { params: data })
}

export function payOrder(orderId) {
  return request.post(`/order/pay/${orderId}`)
}

export function cancelOrder(orderId, reason) {
  return request.post(`/order/cancel/${orderId}`, null, { params: { reason } })
}
