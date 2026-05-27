import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
}

export const projectAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getAllProjects: () => api.get('/projects/all'),
  getProject: (slug) => api.get(`/projects/${slug}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
}

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

export const skillAPI = {
  getSkills: (params) => api.get('/skills', { params }),
  createSkill: (data) => api.post('/skills', data),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
}

export const aboutAPI = {
  getAbout: () => api.get('/about'),
  updateAbout: (data) => api.put('/about', data),
}

export const contactAPI = {
  createContact: (data) => api.post('/contact', data),
  getContacts: (params) => api.get('/contacts', { params }),
  markRead: (id) => api.put(`/contacts/${id}/read`),
  deleteContact: (id) => api.delete(`/contacts/${id}`),
}

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default api
