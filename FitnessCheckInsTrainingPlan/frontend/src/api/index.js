import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

const convertKeysToCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item))
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj = {}
    Object.keys(obj).forEach(key => {
      const camelKey = toCamelCase(key)
      newObj[camelKey] = convertKeysToCamelCase(obj[key])
    })
    return newObj
  }
  return obj
}

api.interceptors.response.use((response) => {
  if (response.data) {
    response.data = convertKeysToCamelCase(response.data)
  }
  return response
})

export const exerciseApi = {
  getAll: (category) => api.get('/exercises', { params: { category } }),
  create: (data) => api.post('/exercises', data)
}

export const planApi = {
  getAll: () => api.get('/plans'),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`)
}

export const checkInApi = {
  getAll: (year, month) => api.get('/checkins', { params: { year, month } }),
  getToday: () => api.get('/checkins/today'),
  create: (data) => api.post('/checkins', data)
}

export const bodyRecordApi = {
  getAll: () => api.get('/body-records'),
  create: (data) => api.post('/body-records', data)
}

export const achievementApi = {
  getAll: () => api.get('/achievements')
}

export const statsApi = {
  get: () => api.get('/stats')
}

export default api
