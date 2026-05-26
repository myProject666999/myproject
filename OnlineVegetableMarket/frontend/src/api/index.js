import axios from 'axios'
import { useUserStore } from '../stores/user'
import { showToast } from 'vant'

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const data = error.response.data
      
      if (error.response.status === 401) {
        const userStore = useUserStore()
        userStore.logout()
        showToast('登录已过期，请重新登录')
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else if (data && data.error) {
        showToast(data.error)
      } else {
        showToast('请求失败，请稍后重试')
      }
    } else {
      showToast('网络连接失败')
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => service.post('/auth/register', data),
  login: (data) => service.post('/auth/login', data),
  getProfile: () => service.get('/auth/profile'),
  updateProfile: (data) => service.put('/auth/profile', data),
}

export const categoryApi = {
  getCategories: () => service.get('/categories'),
}

export const productApi = {
  getProducts: (params) => service.get('/products', { params }),
  getProduct: (id) => service.get(`/products/${id}`),
  createProduct: (data) => service.post('/products', data),
  updateProduct: (id, data) => service.put(`/products/${id}`, data),
  deleteProduct: (id) => service.delete(`/products/${id}`),
}

export const cartApi = {
  getCart: () => service.get('/cart'),
  addToCart: (data) => service.post('/cart', data),
  updateCartItem: (id, data) => service.put(`/cart/${id}`, data),
  removeFromCart: (id) => service.delete(`/cart/${id}`),
  batchUpdateSelect: (data) => service.put('/cart/batch/select', data),
  clearCart: () => service.delete('/cart'),
}

export const orderApi = {
  createOrder: (data) => service.post('/orders', data),
  getOrders: (params) => service.get('/orders', { params }),
  getOrder: (id) => service.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => service.put(`/orders/${id}/status`, data),
  addDeliveryRecord: (id, data) => service.post(`/orders/${id}/delivery`, data),
}

export const slotApi = {
  getSlots: (params) => service.get('/delivery-slots', { params }),
  getAvailableSlots: (params) => service.get('/delivery-slots/available', { params }),
  createSlot: (data) => service.post('/delivery-slots', data),
  updateSlot: (id, data) => service.put(`/delivery-slots/${id}`, data),
  deleteSlot: (id) => service.delete(`/delivery-slots/${id}`),
  generateSlots: (data) => service.post('/delivery-slots/generate', data),
}

export const inventoryApi = {
  getInventory: (params) => service.get('/inventory', { params }),
  updateInventory: (data) => service.put('/inventory', data),
  getInventoryByProduct: (id, params) => service.get(`/inventory/product/${id}`, { params }),
}

export default service
