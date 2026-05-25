import request from '../utils/request'

export const documentApi = {
  getList: (params) => request.get('/documents', { params }),

  getDetail: (id) => request.get(`/documents/${id}`),

  search: (params) => request.get('/documents/search', { params }),

  upload: (formData, onProgress) => {
    return request.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(progress)
        }
      }
    })
  },

  update: (id, data) => request.put(`/documents/${id}`, data),

  delete: (id) => request.delete(`/documents/${id}`),

  download: (id) => {
    window.open(`/api/documents/${id}/download`, '_blank')
  },

  like: (id) => request.post(`/documents/${id}/like`),

  favorite: (id) => request.post(`/documents/${id}/favorite`),

  share: (id, data) => request.post(`/documents/${id}/share`, data),

  getComments: (id, params) =>
    request.get(`/documents/${id}/comments`, { params }),

  addComment: (id, data) => request.post(`/documents/${id}/comments`, data)
}
