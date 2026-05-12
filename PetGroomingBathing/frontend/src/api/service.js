import request from '@/utils/request'

export const getServices = (category) => {
  return request.get('/services', { params: { category } })
}

export const getService = (id) => {
  return request.get(`/services/${id}`)
}

export const createService = (data) => {
  return request.post('/services', data)
}

export const updateService = (id, data) => {
  return request.patch(`/services/${id}`, data)
}

export const deleteService = (id) => {
  return request.delete(`/services/${id}`)
}
