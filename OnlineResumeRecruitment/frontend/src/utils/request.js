import axios from 'axios'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
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
    if (res && res.code !== undefined && res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data !== undefined ? res.data : res
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        message.error('登录已过期，请重新登录')
        window.location.hash = '#/login'
      } else if (status === 403) {
        message.error('没有访问权限')
      } else if (status >= 500) {
        message.error('服务器错误，请稍后重试')
      } else {
        message.error(error.response.data?.message || '请求失败')
      }
    } else {
      message.error('网络异常，请检查网络')
    }
    return Promise.reject(error)
  }
)

export default request
