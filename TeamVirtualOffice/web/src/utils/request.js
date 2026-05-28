import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/',
  timeout: 30000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
    if (res.code !== undefined && res.code !== 0) {
      ElMessage.error(res.message || 'Error')
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
        ElMessage.error('Please login first')
      } else if (status === 403) {
        ElMessage.error(data?.message || 'No permission')
      } else if (status === 500) {
        ElMessage.error('Server error')
      } else {
        ElMessage.error(data?.message || error.message)
      }
    } else if (error.request) {
      ElMessage.error('Network error')
    } else {
      ElMessage.error(error.message)
    }
    return Promise.reject(error)
  }
)

export default request
