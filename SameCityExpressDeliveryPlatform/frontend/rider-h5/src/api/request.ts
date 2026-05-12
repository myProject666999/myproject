import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { showToast } from 'vant'

const instance: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('rider_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    } else {
      showToast(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rider_token')
      window.location.href = '/login'
    } else {
      showToast(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default instance
