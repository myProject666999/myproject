import request from '@/utils/request'

export const getAppointments = (params) => {
  return request.get('/appointments', { params })
}

export const getAppointment = (id) => {
  return request.get(`/appointments/${id}`)
}

export const createAppointment = (data) => {
  return request.post('/appointments', data)
}

export const updateAppointment = (id, data) => {
  return request.patch(`/appointments/${id}`, data)
}

export const deleteAppointment = (id) => {
  return request.delete(`/appointments/${id}`)
}
