import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

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
    if (res.code !== undefined && res.code !== 0) {
      ElMessage.error(res.msg || '请求失败')
      if (res.code === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }
      return Promise.reject(new Error(res.msg))
    }
    return res
  },
  (error) => {
    let msg = error.message || '网络错误'
    if (error.response) {
      if (error.response.data && error.response.data.msg) {
        msg = error.response.data.msg
      } else if (error.response.status === 401) {
        msg = '未登录或登录已过期'
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        router.push('/login')
      } else if (error.response.status === 400) {
        msg = error.response.data?.msg || '请求参数错误'
      } else if (error.response.status === 403) {
        msg = '没有访问权限'
      } else if (error.response.status === 404) {
        msg = '资源不存在'
      } else if (error.response.status === 409) {
        msg = error.response.data?.msg || '资源冲突'
      } else if (error.response.status >= 500) {
        msg = '服务器内部错误'
      }
    }
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request
