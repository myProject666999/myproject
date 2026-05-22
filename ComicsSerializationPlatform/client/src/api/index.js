import request from './request'

export const userApi = {
  register: (data) => request.post('/users/register', data),
  login: (data) => request.post('/users/login', data),
  getProfile: () => request.get('/users/profile'),
  updateProfile: (data) => request.put('/users/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const comicApi = {
  getList: (params) => request.get('/comics', { params }),
  getDetail: (id) => request.get(`/comics/${id}`),
  getMyComics: () => request.get('/comics/my'),
  create: (data) => request.post('/comics', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => request.put(`/comics/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => request.delete(`/comics/${id}`)
}

export const chapterApi = {
  getList: (comicId) => request.get(`/chapters/comic/${comicId}`),
  getDetail: (comicId, chapterId) => request.get(`/chapters/comic/${comicId}/chapter/${chapterId}`),
  create: (comicId, data) => request.post(`/chapters/comic/${comicId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (chapterId, data) => request.put(`/chapters/${chapterId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (chapterId) => request.delete(`/chapters/${chapterId}`)
}

export const subscriptionApi = {
  toggle: (comicId) => request.post('/subscriptions/toggle', { comicId }),
  getList: () => request.get('/subscriptions'),
  check: (comicId) => request.get(`/subscriptions/check/${comicId}`)
}

export const commentApi = {
  getList: (params) => request.get('/comments', { params }),
  create: (data) => request.post('/comments', data),
  delete: (id) => request.delete(`/comments/${id}`),
  like: (id) => request.post(`/comments/${id}/like`)
}

export const favoriteApi = {
  toggle: (comicId) => request.post('/favorites/toggle', { comicId }),
  getList: () => request.get('/favorites'),
  check: (comicId) => request.get(`/favorites/check/${comicId}`)
}
