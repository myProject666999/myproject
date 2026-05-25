import request from '@/utils/request'

export function getTicketCategories() {
  return request.get('/ticket/categories')
}

export function getTicketPriorities() {
  return request.get('/ticket/priorities')
}

export function getTicketStatuses() {
  return request.get('/ticket/statuses')
}

export function getTicketDetail(id) {
  return request.get(`/ticket/detail/${id}`)
}

export function getTicketList(params) {
  return request.get('/ticket/list', { params })
}

export function createTicket(data) {
  return request.post('/ticket', data)
}

export function updateTicket(data) {
  return request.put('/ticket', data)
}

export function assignTicket(data) {
  return request.post('/ticket/assign', data)
}

export function claimTicket(id) {
  return request.post(`/ticket/claim/${id}`)
}

export function resolveTicket(id) {
  return request.post(`/ticket/resolve/${id}`)
}

export function closeTicket(id) {
  return request.post(`/ticket/close/${id}`)
}

export function reopenTicket(id) {
  return request.post(`/ticket/reopen/${id}`)
}

export function getTicketMessages(ticketId, params) {
  return request.get(`/ticket/messages/${ticketId}`, { params })
}

export function sendTicketMessage(data) {
  return request.post('/ticket/message', data)
}

export function getOperationLogs(ticketId) {
  return request.get(`/ticket/operation-logs/${ticketId}`)
}
