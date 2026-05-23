import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      ElMessage.error(data.message || '请求失败')
    } else {
      ElMessage.error('网络连接失败')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  getProfile: () => request.get('/auth/profile'),
  updateProfile: (data) => request.put('/auth/profile', data)
}

export const recipeAPI = {
  getList: (params) => request.get('/recipes', { params }),
  getDetail: (id) => request.get(`/recipes/${id}`),
  create: (data) => request.post('/recipes', data),
  update: (id, data) => request.put(`/recipes/${id}`, data),
  delete: (id) => request.delete(`/recipes/${id}`),
  getMyRecipes: (params) => request.get('/recipes/my', { params }),
  toggleLike: (id) => request.post(`/recipes/${id}/like`),
  toggleFavorite: (id) => request.post(`/recipes/${id}/favorite`),
  getFavorites: (params) => request.get('/recipes/favorites/list', { params })
}

export const commentAPI = {
  getList: (recipeId, params) => request.get(`/recipes/${recipeId}/comments`, { params }),
  create: (recipeId, data) => request.post(`/recipes/${recipeId}/comments`, data),
  delete: (id) => request.delete(`/recipes/comments/${id}`)
}

export const menuAPI = {
  getWeekMenu: (params) => request.get('/menu/week', { params }),
  addToMenu: (data) => request.post('/menu', data),
  removeFromMenu: (id) => request.delete(`/menu/${id}`),
  generateShoppingList: (params) => request.get('/menu/shopping-list/generate', { params }),
  getShoppingList: (params) => request.get('/menu/shopping-list', { params }),
  toggleShoppingItem: (id, data) => request.put(`/menu/shopping-list/${id}`, data)
}
