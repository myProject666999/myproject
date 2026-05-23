import axios from 'axios'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 15000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
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
    if (res.code !== undefined && res.code !== 0) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        message.error('登录已过期，请重新登录')
        window.location.href = '/login'
      } else {
        message.error(data?.message || error.message)
      }
    } else {
      message.error('网络异常，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request
