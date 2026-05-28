import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '../types'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/api'

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service

export const authApi = {
  register: (data: { phone: string; password: string; nickname: string }) =>
    service.post<ApiResponse>('/auth/register', data),
  login: (data: { phone: string; password: string }) =>
    service.post<ApiResponse>('/auth/login', data),
  getProfile: () => service.get<ApiResponse>('/auth/profile')
}

export const rideApi = {
  create: (data: any) => service.post<ApiResponse>('/rides', data),
  getList: (params: any) => service.get<ApiResponse>('/rides', { params }),
  getNearby: (params: { lng: number; lat: number; radius?: number }) =>
    service.get<ApiResponse>('/rides/nearby', { params }),
  getDetail: (id: number) => service.get<ApiResponse>(`/rides/${id}`),
  updateStatus: (id: number, status: number) =>
    service.put<ApiResponse>(`/rides/${id}/status`, { status })
}

export const requestApi = {
  create: (data: any) => service.post<ApiResponse>('/requests', data),
  getList: (params?: { page?: number; page_size?: number }) =>
    service.get<ApiResponse>('/requests', { params }),
  getDetail: (id: number) => service.get<ApiResponse>(`/requests/${id}`),
  getMatches: (id: number) => service.get<ApiResponse>(`/requests/${id}/matches`)
}

export const orderApi = {
  create: (data: any) => service.post<ApiResponse>('/orders', data),
  getList: (params?: { page?: number; page_size?: number }) =>
    service.get<ApiResponse>('/orders', { params }),
  getDetail: (id: number) => service.get<ApiResponse>(`/orders/${id}`),
  confirm: (id: number) => service.put<ApiResponse>(`/orders/${id}/confirm`),
  reject: (id: number) => service.put<ApiResponse>(`/orders/${id}/reject`),
  start: (id: number) => service.put<ApiResponse>(`/orders/${id}/start`),
  complete: (id: number) => service.put<ApiResponse>(`/orders/${id}/complete`),
  cancel: (id: number, reason: string) =>
    service.put<ApiResponse>(`/orders/${id}/cancel`, { reason })
}

export const locationApi = {
  report: (data: { ride_id: number; lng: number; lat: number; speed?: number; heading?: number }) =>
    service.post<ApiResponse>('/locations', data),
  getRideLocations: (rideId: number) =>
    service.get<ApiResponse>(`/locations/${rideId}`)
}

export const reviewApi = {
  create: (data: {
    order_id: number
    ride_id: number
    reviewee_id: number
    rating: number
    content?: string
    tags?: string
  }) => service.post<ApiResponse>('/reviews', data),
  getUserReviews: (userId: number, params?: { page?: number; page_size?: number }) =>
    service.get<ApiResponse>(`/reviews/user/${userId}`, { params })
}

export const vehicleApi = {
  create: (data: any) => service.post<ApiResponse>('/vehicles', data),
  getList: () => service.get<ApiResponse>('/vehicles'),
  getDetail: (id: number) => service.get<ApiResponse>(`/vehicles/${id}`),
  update: (id: number, data: any) => service.put<ApiResponse>(`/vehicles/${id}`, data),
  delete: (id: number) => service.delete<ApiResponse>(`/vehicles/${id}`)
}
