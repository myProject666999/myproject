import request from '../utils/request'

export const getTags = () => request.get('/tags')
export const getTag = (id) => request.get(`/tags/${id}`)
export const createTag = (data) => request.post('/tags', data)
export const updateTag = (id, data) => request.put(`/tags/${id}`, data)
export const deleteTag = (id) => request.delete(`/tags/${id}`)
