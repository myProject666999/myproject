import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

export const paperApi = {
  getList(params) {
    return request.get('/papers', { params })
  },
  getDetail(id) {
    return request.get(`/papers/${id}`)
  },
  create(data) {
    return request.post('/papers', data)
  },
  update(id, data) {
    return request.put(`/papers/${id}`, data)
  },
  delete(id) {
    return request.delete(`/papers/${id}`)
  },
  upload(file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/papers/upload', formData, {
      onUploadProgress: onProgress
    })
  },
  exportBibTeX(id) {
    return request.get(`/papers/${id}/bibtex`, { responseType: 'blob' })
  },
  exportMultipleBibTeX(ids) {
    return request.post('/papers/bibtex/export', ids, { responseType: 'blob' })
  }
}

export const tagApi = {
  getAll() {
    return request.get('/tags')
  },
  create(data) {
    return request.post('/tags', data)
  },
  update(id, data) {
    return request.put(`/tags/${id}`, data)
  },
  delete(id) {
    return request.delete(`/tags/${id}`)
  }
}

export const noteApi = {
  getAll() {
    return request.get('/notes')
  },
  getByPaperId(paperId) {
    return request.get(`/notes/paper/${paperId}`)
  },
  getDetail(id) {
    return request.get(`/notes/${id}`)
  },
  create(data) {
    return request.post('/notes', data)
  },
  update(id, data) {
    return request.put(`/notes/${id}`, data)
  },
  delete(id) {
    return request.delete(`/notes/${id}`)
  }
}

export default request
