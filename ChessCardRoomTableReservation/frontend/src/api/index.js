import request from '../utils/request'

export function getTables() {
  return request({ url: '/tables', method: 'get' })
}

export function getTableById(id) {
  return request({ url: `/tables/${id}`, method: 'get' })
}

export function getTableTypes() {
  return request({ url: '/table-types', method: 'get' })
}

export function getActiveOrderByTable(tableId) {
  return request({ url: `/orders/table/${tableId}`, method: 'get' })
}

export function getActiveOrders() {
  return request({ url: '/orders/active', method: 'get' })
}

export function getOrderDetail(orderId) {
  return request({ url: `/orders/${orderId}`, method: 'get' })
}

export function openTable(data) {
  return request({ url: '/orders/open', method: 'post', data })
}

export function addProduct(orderId, data) {
  return request({ url: `/orders/${orderId}/products`, method: 'post', data })
}

export function transferTable(data) {
  return request({ url: '/orders/transfer', method: 'post', data })
}

export function mergeTable(data) {
  return request({ url: '/orders/merge', method: 'post', data })
}

export function checkout(orderId, params) {
  const cleanParams = {}
  if (params.paymentMethod) cleanParams.paymentMethod = params.paymentMethod
  if (params.memberId) cleanParams.memberId = params.memberId
  return request({ url: `/orders/${orderId}/checkout`, method: 'post', params: cleanParams })
}

export function getProducts(category) {
  return request({ url: '/products', method: 'get', params: { category } })
}

export function getMembers() {
  return request({ url: '/members', method: 'get' })
}

export function searchMember(keyword) {
  return request({ url: '/members/search', method: 'get', params: { keyword } })
}

export function createMember(data) {
  return request({ url: '/members', method: 'post', data })
}

export function updateMember(data) {
  return request({ url: '/members', method: 'put', data })
}

export function getDailyReport(startTime, endTime) {
  return request({ url: '/orders/report/daily', method: 'get', params: { startTime, endTime } })
}

export function getSummaryReport(startTime, endTime) {
  return request({ url: '/orders/report/summary', method: 'get', params: { startTime, endTime } })
}

export function createProduct(data) {
  return request({ url: '/products', method: 'post', data })
}

export function updateProduct(data) {
  return request({ url: '/products', method: 'put', data })
}

export function deleteProduct(id) {
  return request({ url: `/products/${id}`, method: 'delete' })
}

export function deleteMember(id) {
  return request({ url: `/members/${id}`, method: 'delete' })
}
