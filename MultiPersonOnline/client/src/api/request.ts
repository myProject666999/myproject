import axios from 'axios'
import { storage } from '@/utils/storage'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = storage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.params) {
      Object.keys(config.params).forEach((key) => {
        if (config.params[key] === undefined || config.params[key] === null) {
          delete config.params[key]
        }
      })
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res && res.code !== undefined && res.data !== undefined) {
      return res.data
    }
    return res
  },
  (error) => {
    const status = error.response?.status
    const messageText = error.response?.data?.message || error.message

    if (status === 401) {
      storage.clear()
      message.error('登录已过期，请重新登录')
      window.location.href = '/login'
    } else if (status === 403) {
      message.error('没有权限访问')
    } else if (status === 404) {
      message.error('请求的资源不存在')
    } else if (status >= 500) {
      message.error('服务器错误，请稍后再试')
    } else {
      message.error(messageText)
    }

    return Promise.reject(error)
  },
)

export default request
