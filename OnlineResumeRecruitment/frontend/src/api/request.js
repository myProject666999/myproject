import axios from 'axios'
import { useAuthStore } from '../store'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    }
    message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message))
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      message.error('请先登录')
      window.location.href = '/login'
    } else {
      message.error(error.response?.data?.message || error.message)
    }
    return Promise.reject(error)
  }
)

export default request
