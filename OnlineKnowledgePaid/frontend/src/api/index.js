import axios from 'axios'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 401) {
      const userStore = useUserStore()
      userStore.logout()
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
      return Promise.reject(new Error(res.message))
    }
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res.data
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      ElMessage.error('登录已过期')
      router.push('/login')
    } else {
      ElMessage.error(error.response?.data?.message || error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => request.post('/auth/register', data),
  login: (data) => request.post('/auth/login', data),
  getProfile: () => request.get('/user/profile'),
  getAuthor: (id) => request.get(`/authors/${id}`)
}

export const columnApi = {
  getList: (params) => request.get('/columns', { params }),
  getById: (id) => request.get(`/columns/${id}`),
  create: (data) => request.post('/columns', data),
  update: (id, data) => request.put(`/columns/${id}`, data),
  delete: (id) => request.delete(`/columns/${id}`),
  getMy: () => request.get('/columns/my')
}

export const articleApi = {
  getByColumn: (params) => request.get('/articles', { params }),
  getById: (id) => request.get(`/articles/${id}`),
  create: (data) => request.post('/articles', data),
  update: (id, data) => request.put(`/articles/${id}`, data),
  delete: (id) => request.delete(`/articles/${id}`),
  getMy: () => request.get('/articles/my')
}

export const subscriptionApi = {
  check: (columnId) => request.get('/subscriptions/check', { params: { column_id: columnId } }),
  getMy: (params) => request.get('/subscriptions/my', { params }),
  getByColumn: (params) => request.get('/subscriptions/column', { params })
}

export const orderApi = {
  create: (data) => request.post('/orders', data),
  pay: (data) => request.post('/orders/pay', data),
  getById: (id) => request.get(`/orders/${id}`),
  getMy: (params) => request.get('/orders/my', { params })
}

export const commentApi = {
  getByArticle: (params) => request.get('/comments', { params }),
  create: (data) => request.post('/comments', data),
  delete: (id) => request.delete(`/comments/${id}`)
}

export const likeApi = {
  toggle: (data) => request.post('/likes/toggle', data),
  check: (articleId) => request.get('/likes/check', { params: { article_id: articleId } })
}

export const statsApi = {
  getRevenue: (params) => request.get('/stats/revenue', { params }),
  getOverview: () => request.get('/stats/overview'),
  getColumnStats: (columnId) => request.get('/stats/column', { params: { column_id: columnId } })
}
