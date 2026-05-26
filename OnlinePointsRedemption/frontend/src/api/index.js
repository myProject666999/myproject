import request from './request'

export function getProducts(params) {
  return request.get('/products', { params })
}

export function getProduct(id) {
  return request.get(`/products/${id}`)
}

export function getCategories() {
  return request.get('/products/categories')
}

export function getUserInfo() {
  return request.get('/user/points')
}

export function getPointsDetails(params) {
  return request.get('/user/points/details', { params })
}

export function earnPoints(data) {
  return request.post('/user/points/earn', data)
}

export function getRanking(params) {
  return request.get('/user/ranking', { params })
}

export function createOrder(data) {
  return request.post('/orders', data)
}

export function getOrders(params) {
  return request.get('/orders', { params })
}

export function getOrder(id) {
  return request.get(`/orders/${id}`)
}

export function cancelOrder(data) {
  return request.post('/orders/cancel', data)
}

export function adminGetOrders(params) {
  return request.get('/admin/orders', { params })
}

export function shipOrder(data) {
  return request.post('/admin/orders/ship', data)
}

export function completeOrder(data) {
  return request.post('/admin/orders/complete', data)
}
