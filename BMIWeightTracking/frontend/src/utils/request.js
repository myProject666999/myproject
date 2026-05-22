import axios from 'axios'
import router from '../router'
import { Message } from 'element-ui'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
})

instance.interceptors.response.use(
  res => {
    const data = res.data
    if (data.code !== 200) {
      Message.error(data.msg || '请求失败')
      return Promise.reject(new Error(data.msg))
    }
    return data
  },
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.clear()
      router.push('/login')
    } else {
      Message.error(err.message || '网络错误')
    }
    return Promise.reject(err)
  }
)

export default instance
