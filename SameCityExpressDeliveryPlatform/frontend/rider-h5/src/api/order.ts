import request from './request'

export function getAvailableOrders(params: any = {}) {
  return request.get('/rider/order/available', { params })
}

export function getRiderOrders(params: any = {}) {
  return request.get('/rider/order', { params })
}

export function getOrderDetail(id: number) {
  return request.get(`/rider/order/${id}`)
}

export function acceptOrder(orderId: number) {
  return request.post('/rider/order/accept', { order_id: orderId })
}

export function pickupOrder(orderId: number, pickupPhoto: string) {
  return request.post('/rider/order/pickup', { order_id: orderId, pickup_photo: pickupPhoto })
}

export function deliverOrder(orderId: number, signCode: string, deliveryPhoto: string) {
  return request.post('/rider/order/deliver', { order_id: orderId, sign_code: signCode, delivery_photo: deliveryPhoto })
}

export function getOrderTracks(id: number) {
  return request.get(`/rider/order/${id}/tracks`)
}
