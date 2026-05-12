import request from '@/utils/request'

export const getVehicles = (status) => {
  return request.get('/vehicles', { params: { status } })
}

export const getVehicle = (id) => {
  return request.get(`/vehicles/${id}`)
}

export const createVehicle = (data) => {
  return request.post('/vehicles', data)
}

export const updateVehicle = (id, data) => {
  return request.patch(`/vehicles/${id}`, data)
}

export const deleteVehicle = (id) => {
  return request.delete(`/vehicles/${id}`)
}
