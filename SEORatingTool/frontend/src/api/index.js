import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

export const analyzeURL = (url) => {
  return api.post('/analyze', { url })
}

export const getReport = (id) => {
  return api.get(`/report/${id}`)
}

export const getHistory = (page = 1, pageSize = 10) => {
  return api.get('/history', { params: { page, pageSize } })
}

export const deleteAnalysis = (id) => {
  return api.delete(`/analysis/${id}`)
}
