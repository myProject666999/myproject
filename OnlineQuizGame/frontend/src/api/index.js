import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const login = (data) => {
  return request.post('/login', data)
}

export const getCategories = () => {
  return request.get('/categories')
}

export const startQuiz = (data) => {
  return request.post('/quiz/start', data)
}

export const submitAnswer = (data) => {
  return request.post('/quiz/submit', data)
}

export const finishQuiz = (data) => {
  return request.post('/quiz/finish', data)
}

export const getLeaderboard = (params) => {
  return request.get('/leaderboard', { params })
}

export const getUserRank = (params) => {
  return request.get('/user/rank', { params })
}

export const getHistory = (params) => {
  return request.get('/history', { params })
}

export const getGameDetail = (params) => {
  return request.get('/game/detail', { params })
}

export default request
