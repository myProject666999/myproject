import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response) {
      return err.response.data
    }
    return { code: 500, message: '网络错误' }
  }
)

export default api

export const captchaApi = {
  get: () => api.get('/captcha')
}

export const authApi = {
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me')
}

export const activityApi = {
  list: (params) => api.get('/activities', { params }),
  get: (id) => api.get(`/activities/${id}`),
  result: (id) => api.get(`/activities/${id}/result`),
  create: (data) => api.post('/admin/activities', data),
  update: (id, data) => api.put(`/admin/activities/${id}`, data),
  remove: (id) => api.delete(`/admin/activities/${id}`)
}

export const voteApi = {
  submit: (data) => api.post('/vote', data)
}

export const lotteryApi = {
  draw: (id) => api.post(`/lottery/${id}`),
  records: (id) => api.get(`/activities/${id}/lottery-records`),
  voteRecords: (id) => api.get(`/activities/${id}/vote-records`)
}
