import axios from 'axios'
import { showToast } from 'vant'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 0) {
      showToast(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  error => {
    showToast(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const userApi = {
  login: (phone) => request.post('/user/login', `phone=${encodeURIComponent(phone)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  getInfo: (id) => request.get(`/user/${id}`)
}

export const restaurantApi = {
  list: () => request.get('/restaurant'),
  detail: (id) => request.get(`/restaurant/${id}`),
  getTableTypes: (restaurantId) => request.get(`/restaurant/${restaurantId}/table-types`)
}

export const queueApi = {
  create: (data) => request.post('/queue', data),
  info: (id) => request.get(`/queue/${id}`),
  userQueues: (userId) => request.get(`/queue/user/${userId}`),
  cancel: (id, userId) => request.post(`/queue/${id}/cancel?user_id=${userId}`),
  call: (data) => request.post('/queue/call', data),
  calledList: (restaurantId, count = 10) => request.get(`/queue/called/${restaurantId}?count=${count}`),
  waitingList: (restaurantId, prefix) => request.get(`/queue/waiting/${restaurantId}/${prefix}`),
  markOver: (queueId) => request.post('/queue/over', { queue_id: queueId }),
  markSeated: (queueId) => request.post('/queue/seated', { queue_id: queueId }),
  markCompleted: (queueId) => request.post('/queue/completed', { queue_id: queueId })
}

export const reservationApi = {
  create: (data) => request.post('/reservation', data),
  userReservations: (userId, status) => request.get(`/reservation/user/${userId}${status ? `?status=${status}` : ''}`),
  cancel: (id, userId) => request.post(`/reservation/${id}/cancel?user_id=${userId}`),
  getTimeSlots: (restaurantId, tableTypeId, date) => 
    request.get(`/reservation/timeslots/${restaurantId}/${tableTypeId}?date=${date}`),
  verify: (data) => request.post('/reservation/verify', data)
}

export default request
