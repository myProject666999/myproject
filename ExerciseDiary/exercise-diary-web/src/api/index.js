import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    if (response.data.code === 200) {
      return response.data.data
    }
    return Promise.reject(new Error(response.data.msg || '请求失败'))
  },
  error => Promise.reject(error)
)

export const getTodayRecords = () => request.get('/record/today')
export const getHistory = (page, size) => request.get('/record/history', { params: { page, size } })
export const getMonthlyStats = (year, month) => request.get('/record/monthly', { params: { year, month } })
export const getDailyStats = (date) => request.get('/record/daily', { params: { date } })
export const addRecord = (data) => request.post('/record', data)
export const deleteRecord = (id) => request.delete(`/record/${id}`)
export const getExerciseTypes = () => request.get('/type/list')
export const getPrList = () => request.get('/pr/list')

export default request
