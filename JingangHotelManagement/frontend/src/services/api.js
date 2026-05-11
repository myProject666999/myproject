import axios from 'axios'
import { message } from 'antd'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

instance.interceptors.response.use(
  response => {
    const { data } = response
    if (data.code !== 200) {
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return data
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/user/login'
    } else {
      message.error(error.response?.data?.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default instance

export const API = {
  register: data => instance.post('/register', data),
  login: data => instance.post('/login', data),
  adminLogin: data => instance.post('/admin/login', data),
  getProfile: () => instance.get('/user/profile'),
  updateProfile: data => instance.put('/user/profile', data),
  changePassword: data => instance.post('/user/change-password', data),

  getRoomTypes: () => instance.get('/room-types'),
  getAvailableRooms: params => instance.get('/rooms/available', { params }),

  createOrder: data => instance.post('/user/orders', data),
  getOrders: params => instance.get('/user/orders', { params }),
  getOrderDetail: id => instance.get(`/user/orders/${id}`),
  payOrder: id => instance.post(`/user/orders/${id}/pay`),
  cancelOrder: id => instance.post(`/user/orders/${id}/cancel`),
  applyCancelOrder: id => instance.post(`/user/orders/${id}/apply-cancel`),

  getReviews: () => instance.get('/reviews'),
  getMyReviews: params => instance.get('/user/my-reviews', { params }),
  createReview: data => instance.post('/user/reviews', data),

  getPointsRecords: () => instance.get('/user/points-records'),
  getProducts: () => instance.get('/products'),
  exchangeProduct: data => instance.post('/user/exchange-product', data),
  getProductOrders: () => instance.get('/user/product-orders'),

  getAdmins: () => instance.get('/admin/admins'),
  createAdmin: data => instance.post('/admin/admins', data),
  updateAdmin: (id, data) => instance.put(`/admin/admins/${id}`, data),
  deleteAdmin: id => instance.delete(`/admin/admins/${id}`),

  getUsers: () => instance.get('/admin/users'),
  updateUser: (id, data) => instance.put(`/admin/users/${id}`, data),

  getAdminRoomTypes: () => instance.get('/admin/room-types'),
  createRoomType: data => instance.post('/admin/room-types', data),
  updateRoomType: (id, data) => instance.put(`/admin/room-types/${id}`, data),
  deleteRoomType: id => instance.delete(`/admin/room-types/${id}`),

  getAdminRooms: () => instance.get('/admin/rooms'),
  createRoom: data => instance.post('/admin/rooms', data),
  updateRoom: (id, data) => instance.put(`/admin/rooms/${id}`, data),
  deleteRoom: id => instance.delete(`/admin/rooms/${id}`),

  getAdminOrders: () => instance.get('/admin/orders'),
  updateOrderStatus: (id, data) => instance.put(`/admin/orders/${id}/status`, data),

  getAdminReviews: () => instance.get('/admin/reviews'),
  auditReview: (id, data) => instance.put(`/admin/reviews/${id}/audit`, data),

  getAdminProducts: () => instance.get('/admin/products'),
  createProduct: data => instance.post('/admin/products', data),
  updateProduct: (id, data) => instance.put(`/admin/products/${id}`, data),
  deleteProduct: id => instance.delete(`/admin/products/${id}`),

  getStatistics: params => instance.get('/admin/statistics', { params })
}
