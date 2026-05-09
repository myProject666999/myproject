import axios from 'axios'

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
    const data = response.data
    if (data.code === 200) {
      return data.data
    }
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const adminApi = {
  login: (data) => api.post('/admin/login', data),
  getInfo: () => api.get('/admin/info'),
  changePassword: (data) => api.post('/admin/password', data),
  getStats: () => api.get('/admin/stats'),
  
  getAdmins: (params) => api.get('/admin/admins', { params }),
  createAdmin: (data) => api.post('/admin/admins', data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  auditStudent: (id, data) => api.post(`/admin/students/${id}/audit`, data),
  
  getServices: (params) => api.get('/admin/services', { params }),
  getService: (id) => api.get(`/admin/services/${id}`),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getAppointment: (id) => api.get(`/admin/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/admin/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/admin/appointments/${id}`),
  
  getKnowledge: (params) => api.get('/admin/knowledge', { params }),
  getKnowledgeItem: (id) => api.get(`/admin/knowledge/${id}`),
  createKnowledge: (data) => api.post('/admin/knowledge', data),
  updateKnowledge: (id, data) => api.put(`/admin/knowledge/${id}`, data),
  deleteKnowledge: (id) => api.delete(`/admin/knowledge/${id}`),
  downloadKnowledge: (id) => `/api/admin/knowledge/${id}/download`,
  
  getMessages: (params) => api.get('/admin/messages', { params }),
  getMessage: (id) => api.get(`/admin/messages/${id}`),
  replyMessage: (id, data) => api.post(`/admin/messages/${id}/reply`, data),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`)
}

export const studentApi = {
  register: (data) => api.post('/student/register', data),
  login: (data) => api.post('/student/login', data),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  changePassword: (data) => api.post('/student/password', data),
  
  getAppointments: (params) => api.get('/student/appointments', { params }),
  createAppointment: (data) => api.post('/student/appointments', data),
  updateAppointment: (id, data) => api.put(`/student/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/student/appointments/${id}`),
  
  getMessages: (params) => api.get('/student/messages', { params }),
  createMessage: (data) => api.post('/student/messages', data)
}

export const publicApi = {
  getHome: () => api.get('/home'),
  
  getServices: (params) => api.get('/services', { params }),
  getService: (id) => api.get(`/services/${id}`),
  
  getKnowledge: (params) => api.get('/knowledge', { params }),
  getKnowledge: (params) => api.get('/knowledge', { params }),
  getKnowledgeItem: (id) => api.get(`/knowledge/${id}`),
  downloadKnowledge: (id) => `/api/knowledge/${id}/download`
}
