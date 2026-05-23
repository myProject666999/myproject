import request from './request'

export const createOrder = (data) => request.post('/orders', data)

export const getOrderById = (id) => request.get(`/orders/${id}`)

export const getOrderByNo = (orderNo) => request.get(`/orders/no/${orderNo}`)

export const getOrdersByTable = (tableId) => request.get(`/orders/table/${tableId}`)

export const getActiveOrders = () => request.get('/orders/active')

export const getOrdersByStatus = (statuses) => request.get('/orders/status', { params: { statuses } })

export const confirmOrder = (id) => request.put(`/orders/${id}/confirm`)

export const startCooking = (itemId) => request.put(`/orders/item/${itemId}/cook`)

export const serveDish = (itemId) => request.put(`/orders/item/${itemId}/serve`)

export const completeOrder = (id) => request.put(`/orders/${id}/complete`)

export const cancelOrder = (id) => request.put(`/orders/${id}/cancel`)

export const payOrder = (id) => request.put(`/orders/${id}/pay`)
