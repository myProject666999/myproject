import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const recipeApi = {
  getAll: () => api.get('/recipes'),
  getById: (id) => api.get(`/recipes/${id}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
  searchByIngredients: (ingredients, exactMatch = false) =>
    api.get('/recipes/search/by-ingredients', { params: { ingredients, exactMatch } }),
  getFavorites: () => api.get('/recipes/favorites')
}

export const ingredientApi = {
  getAll: () => api.get('/ingredients'),
  getCategories: () => api.get('/ingredients/categories'),
  getByCategory: (category) => api.get(`/ingredients/by-category/${category}`),
  create: (data) => api.post('/ingredients', data)
}

export const seasonApi = {
  getAll: () => api.get('/seasons')
}

export const favoriteApi = {
  check: (recipeId) => api.get(`/favorites/check/${recipeId}`),
  toggle: (recipeId) => api.post(`/favorites/toggle/${recipeId}`),
  add: (recipeId) => api.post(`/favorites/${recipeId}`),
  remove: (recipeId) => api.delete(`/favorites/${recipeId}`)
}

export const uploadApi = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  }
}
