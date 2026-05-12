import request from '@/utils/request'

export const getPets = (keyword) => {
  return request.get('/pets', { params: { keyword } })
}

export const getPet = (id) => {
  return request.get(`/pets/${id}`)
}

export const createPet = (data) => {
  return request.post('/pets', data)
}

export const updatePet = (id, data) => {
  return request.patch(`/pets/${id}`, data)
}

export const deletePet = (id) => {
  return request.delete(`/pets/${id}`)
}
