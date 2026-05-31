import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const policyApi = {
  getAll: () => api.get('/policies'),
  getById: (id) => api.get(`/policies/${id}`),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  delete: (id) => api.delete(`/policies/${id}`),
  getByStatus: (status) => api.get(`/policies/status/${status}`),
  getByType: (type) => api.get(`/policies/type/${type}`),
  getActive: () => api.get('/policies/active'),
  getExpiringSoon: (days) => api.get(`/policies/expiring-soon/${days}`),
}

export const paymentApi = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByPolicyId: (policyId) => api.get(`/payments/policy/${policyId}`),
  getByStatus: (status) => api.get(`/payments/status/${status}`),
  getUpcoming: (days) => api.get(`/payments/upcoming/${days}`),
  getOverdue: () => api.get('/payments/overdue'),
  markAsPaid: (id, data) => api.put(`/payments/${id}/pay`, data),
  updateStatus: (id, data) => api.put(`/payments/${id}/status`, data),
}

export const reminderApi = {
  getAll: () => api.get('/reminders'),
  getById: (id) => api.get(`/reminders/${id}`),
  getByStatus: (status) => api.get(`/reminders/status/${status}`),
  getByType: (type) => api.get(`/reminders/type/${type}`),
  getByPolicyId: (policyId) => api.get(`/reminders/policy/${policyId}`),
  getUpcoming: (days) => api.get(`/reminders/upcoming/${days}`),
  markAsSent: (id) => api.put(`/reminders/${id}/sent`),
  markAsRead: (id) => api.put(`/reminders/${id}/read`),
  getPendingCount: () => api.get('/reminders/count/pending'),
  trigger: () => api.post('/reminders/trigger'),
}

export const claimApi = {
  getAll: () => api.get('/claims'),
  getById: (id) => api.get(`/claims/${id}`),
  getByPolicyId: (policyId) => api.get(`/claims/policy/${policyId}`),
  getByStatus: (status) => api.get(`/claims/status/${status}`),
  create: (policyId, data) => api.post(`/claims/policy/${policyId}`, data),
  updateStatus: (id, data) => api.put(`/claims/${id}/status`, data),
  delete: (id) => api.delete(`/claims/${id}`),
}

export const fileApi = {
  upload: (formData, onProgress) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  }),
  download: (id) => api.get(`/files/download/${id}`, { responseType: 'blob' }),
  getByPolicyId: (policyId) => api.get(`/files/policy/${policyId}`),
  getByClaimId: (claimId) => api.get(`/files/claim/${claimId}`),
  getById: (id) => api.get(`/files/${id}`),
  delete: (id) => api.delete(`/files/${id}`),
}

export const statisticsApi = {
  getOverview: () => api.get('/statistics/overview'),
  getByType: () => api.get('/statistics/by-type'),
}
