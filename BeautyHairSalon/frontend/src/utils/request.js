
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
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
        const userStore = useUserStore()
        if (userStore.token) {
          ElMessage.error('登录已过期，请重新登录')
        }
        userStore.logout()
        router.push('/login')
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    const status = error.response?.status
    const url = error.config?.url || ''
    
    if (status === 401) {
      const userStore = useUserStore()
      if (userStore.token && !url.includes('/auth/login')) {
        ElMessage.error('登录已过期，请重新登录')
        userStore.logout()
        router.push('/login')
      } else if (!url.includes('/auth/login')) {
        router.push('/login')
      }
    } else if (status === 403) {
      ElMessage.error('没有权限访问')
    } else if (status === 500) {
      ElMessage.error('服务器错误，请联系管理员')
    } else if (status === 404) {
      ElMessage.error('请求的资源不存在')
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
