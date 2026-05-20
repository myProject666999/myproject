import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

export const tripApi = {
  list: () => request.get('/trips'),
  get: (id) => request.get(`/trips/${id}`),
  create: (data) => request.post('/trips', data),
  update: (id, data) => request.put(`/trips/${id}`, data),
  delete: (id) => request.delete(`/trips/${id}`)
}

export const dailyScheduleApi = {
  list: (tripId) => request.get(`/daily-schedules/trip/${tripId}`),
  get: (id) => request.get(`/daily-schedules/${id}`),
  create: (data) => request.post('/daily-schedules', data),
  update: (id, data) => request.put(`/daily-schedules/${id}`, data),
  delete: (id) => request.delete(`/daily-schedules/${id}`)
}

export const attractionApi = {
  list: (scheduleId) => request.get(`/attractions/schedule/${scheduleId}`),
  get: (id) => request.get(`/attractions/${id}`),
  create: (data) => request.post('/attractions', data),
  update: (id, data) => request.put(`/attractions/${id}`, data),
  delete: (id) => request.delete(`/attractions/${id}`)
}

export const hotelApi = {
  list: (tripId) => request.get(`/hotels/trip/${tripId}`),
  get: (id) => request.get(`/hotels/${id}`),
  create: (data) => request.post('/hotels', data),
  update: (id, data) => request.put(`/hotels/${id}`, data),
  delete: (id) => request.delete(`/hotels/${id}`)
}

export const budgetApi = {
  list: (tripId) => request.get(`/budgets/trip/${tripId}`),
  get: (id) => request.get(`/budgets/${id}`),
  create: (data) => request.post('/budgets', data),
  update: (id, data) => request.put(`/budgets/${id}`, data),
  delete: (id) => request.delete(`/budgets/${id}`)
}

export const packingItemApi = {
  list: (tripId) => request.get(`/packing-items/trip/${tripId}`),
  get: (id) => request.get(`/packing-items/${id}`),
  create: (data) => request.post('/packing-items', data),
  update: (id, data) => request.put(`/packing-items/${id}`, data),
  delete: (id) => request.delete(`/packing-items/${id}`)
}

export default request
