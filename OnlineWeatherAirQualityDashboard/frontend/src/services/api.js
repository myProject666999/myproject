import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export const cityAPI = {
  getAllCities: () => api.get('/cities'),
  getCitiesWithAQI: () => api.get('/cities/with-aqi'),
  getCityById: (id) => api.get(`/cities/${id}`),
}

export const aqiAPI = {
  getAllLatestAQI: () => api.get('/aqi'),
  getLatestAQI: (cityId) => api.get(`/aqi/${cityId}`),
  getAQIHistory: (cityId, hours = 24) => api.get(`/aqi/${cityId}/history?hours=${hours}`),
}

export const trendAPI = {
  getCityTrend: (cityId, days = 7) => api.get(`/trends/city/${cityId}?days=${days}`),
  getCitiesComparison: (cityIds, days = 7) =>
    api.get(`/trends/comparison?cities=${cityIds.join(',')}&days=${days}`),
}

export const alertAPI = {
  getActiveAlerts: () => api.get('/alerts/active'),
  getAlertsByCity: (cityId, limit = 20) => api.get(`/alerts/city/${cityId}?limit=${limit}`),
  getAllAlerts: (page = 1, pageSize = 20) => api.get(`/alerts?page=${page}&page_size=${pageSize}`),
  resolveAlert: (id) => api.put(`/alerts/${id}/resolve`),
}

export const settingAPI = {
  getAllSettings: () => api.get('/settings'),
  getSetting: (key) => api.get(`/settings/${key}`),
  updateSetting: (key, value, description = '') =>
    api.put('/settings', { key, value, description }),
}

export const getAQIClass = (aqi) => {
  if (aqi <= 50) return 'aqi-excellent'
  if (aqi <= 100) return 'aqi-good'
  if (aqi <= 150) return 'aqi-light'
  if (aqi <= 200) return 'aqi-moderate'
  if (aqi <= 300) return 'aqi-heavy'
  return 'aqi-severe'
}

export const getAQIBadgeClass = (aqi) => {
  if (aqi <= 50) return 'aqi-badge aqi-badge-excellent'
  if (aqi <= 100) return 'aqi-badge aqi-badge-good'
  if (aqi <= 150) return 'aqi-badge aqi-badge-light'
  if (aqi <= 200) return 'aqi-badge aqi-badge-moderate'
  if (aqi <= 300) return 'aqi-badge aqi-badge-heavy'
  return 'aqi-badge aqi-badge-severe'
}

export const getAQILevel = (aqi) => {
  if (aqi <= 50) return '优'
  if (aqi <= 100) return '良'
  if (aqi <= 150) return '轻度污染'
  if (aqi <= 200) return '中度污染'
  if (aqi <= 300) return '重度污染'
  return '严重污染'
}

export const getAlertBadgeClass = (level) => {
  switch (level) {
    case '红色':
      return 'alert-badge alert-red'
    case '橙色':
      return 'alert-badge alert-orange'
    case '黄色':
      return 'alert-badge alert-yellow'
    default:
      return 'alert-badge alert-blue'
  }
}
