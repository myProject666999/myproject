import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { MessageInstance } from 'antd/es/message/interface'

export interface RequestConfig extends AxiosRequestConfig {
  silentError?: boolean
}

let messageApi: MessageInstance | null = null

export function setMessageApi(api: MessageInstance) {
  messageApi = api
}

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
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
    const config = response.config as RequestConfig
    if (res.code !== 200) {
      if (!config.silentError) {
        messageApi?.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    const config = error.config as RequestConfig
    if (!config.silentError) {
      messageApi?.error(error.response?.data?.message || '网络异常，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request
