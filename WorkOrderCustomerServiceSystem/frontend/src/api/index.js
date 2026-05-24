import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    return Promise.reject(error)
  }
)

export const ticketApi = {
  create: (data) => request.post('/tickets', data),
  getById: (id) => request.get(`/tickets/${id}`),
  getPage: (params) => request.get('/tickets/page', { params }),
  assign: (data) => request.post('/tickets/assign', data),
  updateStatus: (id, status, operatorId) => 
    request.put(`/tickets/${id}/status`, null, { params: { status, operatorId } }),
  reply: (data) => request.post('/tickets/reply', data),
  getReplies: (id) => request.get(`/tickets/${id}/replies`),
  getStatusStats: () => request.get('/tickets/statistics/status'),
  getPriorityStats: () => request.get('/tickets/statistics/priority'),
  getDateStats: () => request.get('/tickets/statistics/date'),
  getAgentStats: () => request.get('/tickets/statistics/agent')
}

export const slaApi = {
  checkWarning: () => request.post('/sla/check-warning'),
  checkOverdue: () => request.post('/sla/check-overdue'),
  getWarning: () => request.get('/sla/warning'),
  getOverdue: () => request.get('/sla/overdue')
}

export const userApi = {
  getById: (id) => request.get(`/users/${id}`),
  getAgents: () => request.get('/users/agents'),
  getCustomers: () => request.get('/users/customers'),
  getAll: () => request.get('/users')
}

export const categoryApi = {
  getAll: () => request.get('/categories'),
  getById: (id) => request.get(`/categories/${id}`)
}

export default request