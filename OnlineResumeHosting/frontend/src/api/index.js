import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    if (response.config.responseType === 'blob') {
      return response.data
    }
    const res = response.data
    if (res.code === 200) {
      return res.data
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    return Promise.reject(error)
  }
)

export const resumeApi = {
  list: (userId = 1) => request.get('/resumes', { params: { userId } }),
  get: (id) => request.get(`/resumes/${id}`),
  create: (data) => request.post('/resumes', data),
  update: (id, data) => request.put(`/resumes/${id}`, data),
  delete: (id) => request.delete(`/resumes/${id}`),
  exportPdf: (id) => request.get(`/resumes/${id}/export-pdf`, { responseType: 'blob' }),
  createShortLink: (id) => request.post('/resumes/' + id + '/short-link')
}

export const templateApi = {
  list: () => request.get('/templates')
}

export const visitLogApi = {
  list: (resumeId) => request.get(`/visit-logs/resume/${resumeId}`),
  count: (resumeId) => request.get(`/visit-logs/resume/${resumeId}/count`)
}

export const shortLinkApi = {
  get: (code) => request.get(`/short-links/${code}`)
}

export default request
