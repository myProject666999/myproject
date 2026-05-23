import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export const getRegions = () => api.get('/regions')

export const runTest = (url, regions) => api.post('/test', { url, regions })

export const getTestHistory = (params = {}) => api.get('/test/history', { params })

export const getTestById = (id) => api.get(`/test/${id}`)

export const deleteTest = (id) => api.delete(`/test/${id}`)

export const getMonitorTasks = () => api.get('/monitor')

export const createMonitorTask = (task) => api.post('/monitor', task)

export const updateMonitorTask = (id, data) => api.put(`/monitor/${id}`, data)

export const deleteMonitorTask = (id) => api.delete(`/monitor/${id}`)

export const getMonitorResults = (id) => api.get(`/monitor/${id}/results`)

export default api
