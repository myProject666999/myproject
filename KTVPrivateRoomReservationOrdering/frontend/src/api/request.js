
import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    if (store.state.token) {
      config.headers['Authorization'] = `Bearer ${store.state.token}`
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
      Message({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3000
      })
      if (res.code === 401) {
        store.dispatch('logout')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    Message({
      message: error.message || '网络错误',
      type: 'error',
      duration: 3000
    })
    return Promise.reject(error)
  }
)

export default request
