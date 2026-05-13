import axios from 'axios'
import { showToast } from 'vant'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.hash = '#/login'
      }
      showToast(data?.error || '请求失败')
    } else {
      showToast('网络错误')
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: data => request.post('/auth/register', data),
  login: data => request.post('/auth/login', data),
  getProfile: () => request.get('/auth/profile'),
  updateProfile: data => request.put('/auth/profile', data),
  changePassword: data => request.put('/auth/password', data)
}

export const coachAPI = {
  getAll: params => request.get('/coaches', { params }),
  getById: id => request.get(`/coaches/${id}`),
  getStories: coachId => request.get(`/coaches/${coachId}/stories`)
}

export const courseAPI = {
  getAll: params => request.get('/courses', { params }),
  getById: id => request.get(`/courses/${id}`)
}

export const bookingAPI = {
  getMyBookings: params => request.get('/bookings', { params }),
  getById: id => request.get(`/bookings/${id}`),
  create: data => request.post('/bookings', data),
  cancel: (id, reason) => request.post(`/bookings/${id}/cancel`, { reason })
}

export const checkinAPI = {
  getMyCheckins: () => request.get('/checkins'),
  generateQR: bookingId => request.get(`/checkins/qr/${bookingId}`),
  scan: qrCode => request.post('/checkins/scan', { qrCode })
}

export const trainingAPI = {
  getAll: params => request.get('/trainings', { params }),
  getById: id => request.get(`/trainings/${id}`),
  create: data => request.post('/trainings', data),
  update: (id, data) => request.put(`/trainings/${id}`, data),
  delete: id => request.delete(`/trainings/${id}`)
}

export const bodyTestAPI = {
  getAll: () => request.get('/body-tests'),
  getStats: () => request.get('/body-tests/stats'),
  getById: id => request.get(`/body-tests/${id}`),
  create: data => request.post('/body-tests', data),
  update: (id, data) => request.put(`/body-tests/${id}`, data),
  delete: id => request.delete(`/body-tests/${id}`)
}

export const communityAPI = {
  getAll: params => request.get('/community', { params }),
  getById: id => request.get(`/community/${id}`),
  getMyPosts: () => request.get('/community/me/posts'),
  create: data => request.post('/community', data),
  delete: id => request.delete(`/community/${id}`),
  toggleLike: postId => request.post(`/community/${postId}/like`),
  addComment: (postId, content) => request.post(`/community/${postId}/comments`, { content }),
  getComments: postId => request.get(`/community/${postId}/comments`)
}

export default request
