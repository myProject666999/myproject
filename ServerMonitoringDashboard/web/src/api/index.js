import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err)
    return Promise.reject(err)
  }
)

export const api = {
  getNodes: () => request.get('/nodes'),
  getNode: (id) => request.get(`/nodes/${id}`),
  createNode: (data) => request.post('/nodes', data),
  updateNode: (id, data) => request.put(`/nodes/${id}`, data),
  deleteNode: (id) => request.delete(`/nodes/${id}`),
  regenerateToken: (id) => request.post(`/nodes/${id}/regenerate-token`),

  getLatestMetrics: () => request.get('/metrics/latest'),
  getNodeMetrics: (id, hours = 24) => request.get(`/nodes/${id}/metrics?hours=${hours}`),
  getLatestNodeMetric: (id) => request.get(`/nodes/${id}/metrics/latest`),

  getAlertRules: (nodeId) => request.get('/alert-rules', { params: { node_id: nodeId } }),
  createAlertRule: (data) => request.post('/alert-rules', data),
  toggleAlertRule: (id) => request.post(`/alert-rules/${id}/toggle`),
  deleteAlertRule: (id) => request.delete(`/alert-rules/${id}`),

  getAlertRecords: (params) => request.get('/alert-records', { params }),
  clearAlertRecords: (nodeId) => request.delete('/alert-records', { params: { node_id: nodeId } })
}

export default request
