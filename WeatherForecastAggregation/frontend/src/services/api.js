import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[API] Request failed:', error.message);
    return Promise.reject(error.response?.data || { error: '网络请求失败' });
  }
);

export const cityApi = {
  search: (query) => api.get('/cities/search', { params: { q: query } }),
  getAll: () => api.get('/cities'),
  getById: (id) => api.get(`/cities/${id}`)
};

export const favoriteApi = {
  getAll: () => api.get('/favorites'),
  add: (cityId) => api.post('/favorites', { cityId }),
  remove: (cityId) => api.delete(`/favorites/${cityId}`)
};

export const weatherApi = {
  getCurrent: (cityId) => api.get(`/weather/${cityId}`),
  getForecast: (cityId, days = 7) => api.get(`/weather/${cityId}/forecast`, { params: { days } }),
  getIndices: (cityId) => api.get(`/weather/${cityId}/indices`),
  getAlerts: (cityId) => api.get(`/weather/${cityId}/alerts`),
  getAll: (cityId) => api.get(`/weather/${cityId}/all`),
  refresh: (cityId) => api.post(`/weather/${cityId}/refresh`)
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', { settings })
};

export default api;
