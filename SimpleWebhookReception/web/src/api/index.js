import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const endpointApi = {
  list: () => api.get('/endpoints'),
  get: (id) => api.get(`/endpoints/${id}`),
  create: (data) => api.post('/endpoints', data),
  update: (id, data) => api.put(`/endpoints/${id}`, data),
  delete: (id) => api.delete(`/endpoints/${id}`),
  listRules: (id) => api.get(`/endpoints/${id}/rules`),
  createRule: (id, data) => api.post(`/endpoints/${id}/rules`, data)
}

export const ruleApi = {
  update: (id, data) => api.put(`/rules/${id}`, data),
  delete: (id) => api.delete(`/rules/${id}`)
}

export const requestApi = {
  list: (endpointId) => api.get('/requests', { params: { endpoint_id: endpointId } }),
  get: (id) => api.get(`/requests/${id}`),
  resend: (id) => api.post(`/requests/${id}/resend`),
  delete: (id) => api.delete(`/requests/${id}`)
}

export default api
