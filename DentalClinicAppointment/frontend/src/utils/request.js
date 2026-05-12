import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('Request Error:', error)
    let errorMessage = '网络错误'
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        errorMessage = '登录已过期，请重新登录'
      } else if (error.response.data) {
        const data = error.response.data
        errorMessage = data.message || data.error || JSON.stringify(data)
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    ElMessage.error(errorMessage)
    return Promise.reject(new Error(errorMessage))
  }
)

export default request
