import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const titleApi = {
  list: (keyword) => request.get('/titles', { params: { keyword } }),
  get: (id) => request.get(`/titles/${id}`),
  create: (data) => request.post('/titles', data),
  update: (id, data) => request.put(`/titles/${id}`, data),
  remove: (id) => request.delete(`/titles/${id}`)
}

export const applicationApi = {
  list: (params) => request.get('/applications', { params }),
  get: (id) => request.get(`/applications/${id}`),
  create: (data) => request.post('/applications', data),
  review: (id, data) => request.post(`/applications/${id}/review`, data),
  statusFlow: (id) => request.get(`/applications/${id}/status-flow`)
}

export const invoiceApi = {
  list: (keyword) => request.get('/invoices', { params: { keyword } }),
  get: (id) => request.get(`/invoices/${id}`),
  issue: (id, data) => request.post(`/invoices/${id}/issue`, data)
}

export const statisticsApi = {
  get: () => request.get('/statistics')
}

export default request