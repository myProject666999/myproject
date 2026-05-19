import request from '../utils/request'

export const getRecordsByDate = (date) => request.get(`/records/date/${date}`)
export const getRecordsByRange = (startDate, endDate) => request.get('/records/range', { params: { startDate, endDate } })
export const createRecord = (data) => request.post('/records', data)
export const updateRecord = (id, data) => request.put(`/records/${id}`, data)
export const deleteRecord = (id) => request.delete(`/records/${id}`)
export const getStatisticsByCategory = (startDate, endDate) => request.get('/records/statistics/category', { params: { startDate, endDate } })
export const getStatisticsByDate = (startDate, endDate) => request.get('/records/statistics/date', { params: { startDate, endDate } })
