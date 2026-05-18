import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const saveDiary = (data) => {
  return request.post('/diary', data)
}

export const getTodayDiary = (userId = 1) => {
  return request.get('/diary/today', { params: { userId } })
}

export const getDiaryById = (id) => {
  return request.get(`/diary/${id}`)
}

export const getDiaryList = (params) => {
  return request.get('/diary/list', { params })
}

export const getMonthlyMoodTrend = (params) => {
  return request.get('/diary/trend/monthly', { params })
}

export const getMoodStatistics = (params) => {
  return request.get('/diary/statistics', { params })
}

export const deleteDiary = (id) => {
  return request.delete(`/diary/${id}`)
}

export default request
