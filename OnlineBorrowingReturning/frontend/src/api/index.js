import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (!res.success) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const itemApi = {
  getItems: (params) => request.get('/items', { params }),
  getItem: (id) => request.get(`/items/${id}`),
  createItem: (data) => request.post('/items', data),
  updateItem: (id, data) => request.put(`/items/${id}`, data),
  deleteItem: (id) => request.delete(`/items/${id}`),
  getStats: () => request.get('/stats/items')
}

export const borrowApi = {
  getBorrows: (params) => request.get('/borrows', { params }),
  getBorrow: (id) => request.get(`/borrows/${id}`),
  createBorrow: (data) => request.post('/borrows', data),
  returnItem: (id, data) => request.put(`/borrows/${id}/return`, data),
  getStats: () => request.get('/stats/borrows')
}

export const reservationApi = {
  getReservations: (params) => request.get('/reservations', { params }),
  getReservation: (id) => request.get(`/reservations/${id}`),
  createReservation: (data) => request.post('/reservations', data),
  cancelReservation: (id) => request.put(`/reservations/${id}/cancel`),
  getItemQueue: (itemId) => request.get(`/reservations/item/${itemId}/queue`)
}
