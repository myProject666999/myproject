import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

let loadingCount = 0

const showLoading = () => {
  if (loadingCount === 0) {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })
  }
  loadingCount++
}

const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    closeToast()
  }
}

request.interceptors.request.use(
  (config) => {
    if (!config.hideLoading) {
      showLoading()
    }
    
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    hideLoading()
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    hideLoading()
    
    const res = response.data
    
    if (res.code !== 0 && res.code !== 200) {
      showToast(res.message || '请求失败')
      
      if (res.code === 401 || res.code === 403) {
        removeToken()
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res.data
  },
  (error) => {
    hideLoading()
    
    if (error.response) {
      const status = error.response.status
      
      if (status === 401) {
        removeToken()
        showToast('登录已过期，请重新登录')
        router.push('/login')
      } else if (status === 403) {
        showToast('无权限访问')
      } else if (status === 404) {
        showToast('请求的资源不存在')
      } else if (status >= 500) {
        showToast('服务器错误，请稍后重试')
      } else {
        showToast(error.response.data?.message || error.message)
      }
    } else if (error.message.includes('timeout')) {
      showToast('请求超时，请检查网络')
    } else {
      showToast(error.message || '网络错误')
    }
    
    return Promise.reject(error)
  }
)

export default request
