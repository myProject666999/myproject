import axios from 'axios'
import { message } from 'antd'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return res
    } else {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      window.location.href = '/login'
    }
    message.error(error.response?.data?.message || error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const login = (data) => api.post('/login', data)
export const getCurrentUser = () => api.get('/me')

export const getAdmins = () => api.get('/admins')
export const createAdmin = (data) => api.post('/admins', data)
export const updateAdmin = (id, data) => api.put(`/admins/${id}`, data)
export const deleteAdmin = (id) => api.delete(`/admins/${id}`)
export const changeAdminPassword = (data) => api.post('/admin/change-password', data)

export const getUsers = (params) => api.get('/users', { params })
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
export const changeUserPassword = (data) => api.post('/user/change-password', data)

export const getCommunities = (params) => api.get('/communities', { params })
export const createCommunity = (data) => api.post('/communities', data)
export const updateCommunity = (id, data) => api.put(`/communities/${id}`, data)
export const deleteCommunity = (id) => api.delete(`/communities/${id}`)

export const getSettlementTypes = (params) => api.get('/settlement-types', { params })
export const createSettlementType = (data) => api.post('/settlement-types', data)
export const updateSettlementType = (id, data) => api.put(`/settlement-types/${id}`, data)
export const deleteSettlementType = (id) => api.delete(`/settlement-types/${id}`)

export const getWaterPrices = () => api.get('/water-prices')
export const createWaterPrice = (data) => api.post('/water-prices', data)
export const updateWaterPrice = (id, data) => api.put(`/water-prices/${id}`, data)
export const deleteWaterPrice = (id) => api.delete(`/water-prices/${id}`)

export const getWaterMeters = (params) => api.get('/water-meters', { params })
export const createWaterMeter = (data) => api.post('/water-meters', data)
export const updateWaterMeter = (id, data) => api.put(`/water-meters/${id}`, data)
export const deleteWaterMeter = (id) => api.delete(`/water-meters/${id}`)

export const getWaterBills = (params) => api.get('/water-bills', { params })
export const getUserBills = () => api.get('/user/bills')
export const createWaterBill = (data) => api.post('/water-bills', data)
export const updateWaterBill = (id, data) => api.put(`/water-bills/${id}`, data)
export const payWaterBill = (id) => api.post(`/water-bills/${id}/pay`)
export const deleteWaterBill = (id) => api.delete(`/water-bills/${id}`)

export default api
