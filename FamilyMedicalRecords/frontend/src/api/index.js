import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  res => {
    const data = res.data
    if (data.code !== 200) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return data
  },
  err => {
    ElMessage.error(err.message || '网络错误')
    return Promise.reject(err)
  }
)

export const memberApi = {
  list: () => request.get('/members'),
  get: id => request.get(`/members/${id}`),
  create: data => request.post('/members', data),
  update: (id, data) => request.put(`/members/${id}`, data),
  delete: id => request.delete(`/members/${id}`)
}

export const visitApi = {
  list: (memberId) => request.get('/visits', { params: { memberId } }),
  get: id => request.get(`/visits/${id}`),
  create: data => request.post('/visits', data),
  update: (id, data) => request.put(`/visits/${id}`, data),
  delete: id => request.delete(`/visits/${id}`)
}

export const allergyApi = {
  list: (memberId) => request.get('/allergies', { params: { memberId } }),
  create: data => request.post('/allergies', data),
  update: (id, data) => request.put(`/allergies/${id}`, data),
  delete: id => request.delete(`/allergies/${id}`)
}

export const historyApi = {
  list: (memberId) => request.get('/family-histories', { params: { memberId } }),
  create: data => request.post('/family-histories', data),
  update: (id, data) => request.put(`/family-histories/${id}`, data),
  delete: id => request.delete(`/family-histories/${id}`)
}

export const reminderApi = {
  list: (params) => request.get('/reminders', { params }),
  updateStatus: (id, status) => request.put(`/reminders/${id}/status`, null, { params: { status } }),
  delete: id => request.delete(`/reminders/${id}`)
}
