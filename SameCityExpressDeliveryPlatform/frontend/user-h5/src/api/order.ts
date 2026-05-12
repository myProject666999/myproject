import request from './request'

export function calculatePrice(data: any) {
  return request.post('/user/order/calculate-price', data)
}

export function createOrder(data: any) {
  return request.post('/user/order', data)
}

export function getOrders(params: any = {}) {
  return request.get('/user/order', { params })
}

export function getOrderDetail(id: number) {
  return request.get(`/user/order/${id}`)
}

export function cancelOrder(orderId: number, reason: string) {
  return request.post('/user/order/cancel', { order_id: orderId, reason })
}

export function rateOrder(orderId: number, rating: number, comment: string) {
  return request.post('/user/order/rate', { order_id: orderId, rating, comment })
}

export function getOrderTracks(id: number) {
  return request.get(`/user/order/${id}/tracks`)
}
