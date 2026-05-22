import axios from 'axios'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

request.interceptors.response.use(
    response => {
        const res = response.data
        if (res.code !== 200) {
            return Promise.reject(new Error(res.message || '请求失败'))
        }
        return res.data
    },
    error => {
        return Promise.reject(error)
    }
)

export const sleepApi = {
    createRecord: (data) => request.post('/sleep/record', data),
    updateRecord: (id, data) => request.put(`/sleep/record/${id}`, data),
    deleteRecord: (id) => request.delete(`/sleep/record/${id}`),
    getRecord: (id) => request.get(`/sleep/record/${id}`),
    getRecords: (startDate, endDate) => request.get('/sleep/records', {
        params: { startDate, endDate }
    }),
    getReport: (startDate, endDate) => request.get('/sleep/report', {
        params: { startDate, endDate }
    }),
    getTodayStat: () => request.get('/sleep/today')
}
