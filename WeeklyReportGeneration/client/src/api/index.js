import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

request.interceptors.response.use(
    response => {
        const res = response.data
        if (res.success === false) {
            ElMessage.error(res.message || '请求失败')
            return Promise.reject(new Error(res.message))
        }
        return res
    },
    error => {
        ElMessage.error(error.message || '网络错误')
        return Promise.reject(error)
    }
)

export const templateApi = {
    getAll: () => request.get('/templates'),
    getById: (id) => request.get(`/templates/${id}`),
    create: (data) => request.post('/templates', data),
    update: (id, data) => request.put(`/templates/${id}`, data),
    delete: (id) => request.delete(`/templates/${id}`),
    render: (id, data) => request.post(`/templates/${id}/render`, { data })
}

export const reportApi = {
    getAll: (params) => request.get('/reports', { params }),
    getById: (id) => request.get(`/reports/${id}`),
    getByWeek: (weekStart, weekEnd) => request.get(`/reports/week/${weekStart}/${weekEnd}`),
    create: (data) => request.post('/reports', data),
    update: (id, data) => request.put(`/reports/${id}`, data),
    delete: (id) => request.delete(`/reports/${id}`),
    publish: (id) => request.post(`/reports/${id}/publish`),
    archive: (id) => request.post(`/reports/${id}/archive`),
    export: (id, data) => request.post(`/reports/${id}/export`, data),
    aiPolish: (id) => request.post(`/reports/${id}/ai-polish`)
}

export const dataSourceApi = {
    getAll: (params) => request.get('/data-sources', { params }),
    getById: (id) => request.get(`/data-sources/${id}`),
    getByWeek: (weekStart, weekEnd) => request.get(`/data-sources/week/${weekStart}/${weekEnd}`),
    getByType: (type) => request.get(`/data-sources/type/${type}`),
    create: (data) => request.post('/data-sources', data),
    update: (id, data) => request.put(`/data-sources/${id}`, data),
    delete: (id) => request.delete(`/data-sources/${id}`),
    importGit: (data) => request.post('/data-sources/git/import', data),
    batchCreate: (data) => request.post('/data-sources/batch', data)
}

export const userApi = {
    getAll: () => request.get('/users'),
    getById: (id) => request.get(`/users/${id}`),
    create: (data) => request.post('/users', data),
    update: (id, data) => request.put(`/users/${id}`, data),
    delete: (id) => request.delete(`/users/${id}`)
}
