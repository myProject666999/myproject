import request from '@/utils/request'

export const getConsumptions = (params) => {
  return request.get('/consumptions', { params })
}

export const getConsumption = (id) => {
  return request.get(`/consumptions/${id}`)
}

export const getConsumptionStatistics = (startDate, endDate) => {
  return request.get('/consumptions/statistics', { params: { startDate, endDate } })
}

export const createConsumption = (data) => {
  return request.post('/consumptions', data)
}

export const updateConsumption = (id, data) => {
  return request.patch(`/consumptions/${id}`, data)
}

export const deleteConsumption = (id) => {
  return request.delete(`/consumptions/${id}`)
}
