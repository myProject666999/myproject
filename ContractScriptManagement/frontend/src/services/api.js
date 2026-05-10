import axios from 'axios'
import { message } from 'antd'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return res
    } else {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    message.error(error.response?.data?.message || '网络错误')
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

export const carouselApi = {
  list: () => api.get('/carousels'),
  adminList: (params) => api.get('/admin/carousels', { params }),
  get: (id) => api.get(`/admin/carousels/${id}`),
  create: (data) => api.post('/admin/carousels', data),
  update: (id, data) => api.put(`/admin/carousels/${id}`, data),
  remove: (id) => api.delete(`/admin/carousels/${id}`)
}

export const scriptTypeApi = {
  list: () => api.get('/scripts/types'),
  adminList: (params) => api.get('/admin/types', { params }),
  get: (id) => api.get(`/admin/types/${id}`),
  create: (data) => api.post('/admin/types', data),
  update: (id, data) => api.put(`/admin/types/${id}`, data),
  remove: (id) => api.delete(`/admin/types/${id}`)
}

export const scriptApi = {
  list: (params) => api.get('/scripts', { params }),
  hot: () => api.get('/scripts/hot'),
  get: (id) => api.get(`/scripts/${id}`),
  adminList: (params) => api.get('/admin/scripts', { params }),
  adminGet: (id) => api.get(`/admin/scripts/${id}`),
  create: (data) => api.post('/admin/scripts', data),
  update: (id, data) => api.put(`/admin/scripts/${id}`, data),
  remove: (id) => api.delete(`/admin/scripts/${id}`)
}

export const roomApi = {
  list: () => api.get('/rooms'),
  adminList: (params) => api.get('/admin/rooms', { params }),
  get: (id) => api.get(`/admin/rooms/${id}`),
  create: (data) => api.post('/admin/rooms', data),
  update: (id, data) => api.put(`/admin/rooms/${id}`, data),
  remove: (id) => api.delete(`/admin/rooms/${id}`)
}

export const orderApi = {
  myList: (params) => api.get('/orders', { params }),
  create: (data) => api.post('/orders', data),
  get: (id) => api.get(`/orders/${id}`),
  adminList: (params) => api.get('/admin/orders', { params }),
  adminGet: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  remove: (id) => api.delete(`/admin/orders/${id}`)
}

export const discussionApi = {
  list: (params) => api.get('/discussions', { params }),
  get: (id) => api.get(`/discussions/${id}`),
  create: (data) => api.post('/discussions', data),
  myList: (params) => api.get('/my/discussions', { params }),
  adminList: (params) => api.get('/admin/discussions', { params }),
  adminGet: (id) => api.get(`/admin/discussions/${id}`),
  update: (id, data) => api.put(`/admin/discussions/${id}`, data),
  remove: (id) => api.delete(`/admin/discussions/${id}`)
}

export const newsApi = {
  list: (params) => api.get('/news', { params }),
  get: (id) => api.get(`/news/${id}`),
  adminList: (params) => api.get('/admin/news', { params }),
  adminGet: (id) => api.get(`/admin/news/${id}`),
  create: (data) => api.post('/admin/news', data),
  update: (id, data) => api.put(`/admin/news/${id}`, data),
  remove: (id) => api.delete(`/admin/news/${id}`)
}

export const userApi = {
  list: (params) => api.get('/admin/users', { params }),
  get: (id) => api.get(`/admin/users/${id}`),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  remove: (id) => api.delete(`/admin/users/${id}`)
}

export default api
