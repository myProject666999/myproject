import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => {
    if (response.data.code === 0) {
      return response.data.data
    }
    return Promise.reject(new Error(response.data.message || '请求失败'))
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const foodApi = {
  getAll: (params) => api.get('/foods', { params }),
  search: (q, category) => api.get('/foods/search', { params: { q, category } }),
  getCategories: () => api.get('/foods/categories'),
  getById: (id) => api.get(`/foods/${id}`),
  create: (data) => api.post('/foods', data),
  update: (id, data) => api.put(`/foods/${id}`, data),
  delete: (id) => api.delete(`/foods/${id}`)
}

export const mealApi = {
  getByDate: (date) => api.get('/meals', { params: { date } }),
  create: (data) => api.post('/meals', data),
  delete: (id) => api.delete(`/meals/${id}`),
  addItem: (mealId, data) => api.post(`/meals/${mealId}/items`, data),
  updateItem: (itemId, data) => api.put(`/meals/items/${itemId}`, data),
  deleteItem: (itemId) => api.delete(`/meals/items/${itemId}`)
}

export const dailyApi = {
  getSummary: (date) => api.get('/daily/summary', { params: { date } }),
  getGoal: (date) => api.get('/daily/goal', { params: { date } }),
  setGoal: (data) => api.post('/daily/goal', data)
}

export const weightApi = {
  getAll: (params) => api.get('/weight', { params }),
  add: (data) => api.post('/weight', data),
  delete: (id) => api.delete(`/weight/${id}`)
}

export const statsApi = {
  getStatistics: (start, end) => api.get('/statistics', { params: { start, end } }),
  exportData: () => api.get('/export')
}

export default api
