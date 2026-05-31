import request from '../utils/request'

export function getReportList(params) {
  return request.get('/reports', { params })
}

export function getReport(id) {
  return request.get(`/reports/${id}`)
}

export function createReport(data) {
  return request.post('/reports', data)
}

export function updateReport(id, data) {
  return request.put(`/reports/${id}`, data)
}

export function deleteReport(id) {
  return request.delete(`/reports/${id}`)
}

export function generateReport(data) {
  return request.post('/reports/generate', data)
}
