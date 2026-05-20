import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    if (response.data.code === 200) {
      return response.data.data
    }
    return Promise.reject(new Error(response.data.message || '请求失败'))
  },
  error => {
    return Promise.reject(error)
  }
)

export const userApi = {
  getAll: () => request.get('/users'),
  getById: (id) => request.get(`/users/${id}`),
  create: (data) => request.post('/users', data),
  update: (id, data) => request.put(`/users/${id}`, data),
  delete: (id) => request.delete(`/users/${id}`)
}

export const billApi = {
  getAll: () => request.get('/bills'),
  getById: (id) => request.get(`/bills/${id}`),
  create: (data) => request.post('/bills', data),
  update: (id, data) => request.put(`/bills/${id}`, data),
  delete: (id) => request.delete(`/bills/${id}`)
}

export const settlementApi = {
  getDebtMatrix: () => request.get('/settlement/debt-matrix'),
  getTransferPlan: () => request.get('/settlement/transfer-plan')
}
