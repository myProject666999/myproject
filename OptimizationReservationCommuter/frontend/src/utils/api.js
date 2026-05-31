import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import router from '../router'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

api.interceptors.response.use(response => {
  const res = response.data
  if (res.code !== 0) {
    ElMessage.error(res.message || '请求失败')
    if (res.code === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  }
  return res
}, error => {
  if (error.response) {
    if (error.response.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    }
    ElMessage.error(error.response.data?.message || '网络错误')
  } else {
    ElMessage.error('网络连接失败')
  }
  return Promise.reject(error)
})

export default api
