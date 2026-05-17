import request from '../utils/request'

export const getDailyStats = (startDate, endDate) => {
  return request.get('/records/daily', { params: { startDate, endDate } })
}

export const getMonthStats = (startDate, endDate) => {
  return request.get('/records/month', { params: { startDate, endDate } })
}

export const getDayDetail = (date) => {
  return request.get(`/records/day/${date}`)
}

export const getTopExpenseDays = (startDate, endDate, limit = 10) => {
  return request.get('/records/top-expense', { params: { startDate, endDate, limit } })
}

export const addRecord = (data) => {
  return request.post('/records', data)
}

export const updateRecord = (data) => {
  return request.put('/records', data)
}

export const deleteRecord = (id) => {
  return request.delete(`/records/${id}`)
}

export const getCategories = () => {
  return request.get('/categories')
}

export const getCategoriesByType = (type) => {
  return request.get(`/categories/type/${type}`)
}

export const getHolidays = (startDate, endDate) => {
  return request.get('/holidays', { params: { startDate, endDate } })
}

export const getSettings = () => {
  return request.get('/settings')
}

export const updateSettings = (data) => {
  return request.put('/settings', data)
}
