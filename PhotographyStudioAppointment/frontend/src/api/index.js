import request from '@/utils/request'

export const getUsers = (params) => {
  return request.get('/users', { params })
}

export const getStaff = (params) => {
  return request.get('/users/staff', { params })
}

export const createUser = (data) => {
  return request.post('/users', data)
}

export const updateUser = (id, data) => {
  return request.put(`/users/${id}`, data)
}

export const deleteUser = (id) => {
  return request.delete(`/users/${id}`)
}

export const getPackages = (params) => {
  return request.get('/packages', { params })
}

export const getAllPackages = () => {
  return request.get('/packages/all')
}

export const createPackage = (data) => {
  return request.post('/packages', data)
}

export const updatePackage = (id, data) => {
  return request.put(`/packages/${id}`, data)
}

export const deletePackage = (id) => {
  return request.delete(`/packages/${id}`)
}

export const getCostumes = (params) => {
  return request.get('/costumes', { params })
}

export const getAllCostumes = () => {
  return request.get('/costumes/all')
}

export const createCostume = (data) => {
  return request.post('/costumes', data)
}

export const updateCostume = (id, data) => {
  return request.put(`/costumes/${id}`, data)
}

export const deleteCostume = (id) => {
  return request.delete(`/costumes/${id}`)
}

export const getCustomers = (params) => {
  return request.get('/customers', { params })
}

export const createCustomer = (data) => {
  return request.post('/customers', data)
}

export const updateCustomer = (id, data) => {
  return request.put(`/customers/${id}`, data)
}

export const deleteCustomer = (id) => {
  return request.delete(`/customers/${id}`)
}

export const getAppointmentStats = () => {
  return request.get('/appointments/stats')
}

export const getAppointments = (params) => {
  return request.get('/appointments', { params })
}

export const getAppointmentDetail = (id) => {
  return request.get(`/appointments/${id}`)
}

export const createAppointment = (data) => {
  return request.post('/appointments', data)
}

export const updateAppointment = (id, data) => {
  return request.put(`/appointments/${id}`, data)
}

export const updateAppointmentStatus = (id, status) => {
  return request.put(`/appointments/${id}/status`, { status })
}

export const deleteAppointment = (id) => {
  return request.delete(`/appointments/${id}`)
}

export const getSchedules = (params) => {
  return request.get('/schedules', { params })
}

export const getCalendarData = (params) => {
  return request.get('/schedules/calendar', { params })
}

export const createSchedule = (data) => {
  return request.post('/schedules', data)
}

export const updateSchedule = (id, data) => {
  return request.put(`/schedules/${id}`, data)
}

export const deleteSchedule = (id) => {
  return request.delete(`/schedules/${id}`)
}

export const getPhotos = (params) => {
  return request.get('/photos', { params })
}

export const uploadPhotos = (formData) => {
  return request.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const selectPhotos = (photoIds, selected) => {
  return request.post('/photos/select', { photoIds, selected })
}

export const updatePhotoRemark = (id, remark) => {
  return request.put(`/photos/${id}/remark`, { remark })
}

export const updatePhoto = (id, data) => {
  return request.put(`/photos/${id}`, data)
}

export const deletePhoto = (id) => {
  return request.delete(`/photos/${id}`)
}

export const getWorkOrders = (params) => {
  return request.get('/work-orders', { params })
}

export const getWorkOrderDetail = (id) => {
  return request.get(`/work-orders/${id}`)
}

export const createWorkOrder = (data) => {
  return request.post('/work-orders', data)
}

export const updateWorkOrder = (id, data) => {
  return request.put(`/work-orders/${id}`, data)
}

export const updateWorkOrderStatus = (id, status, feedback) => {
  return request.put(`/work-orders/${id}/status`, { status, feedback })
}

export const deleteWorkOrder = (id) => {
  return request.delete(`/work-orders/${id}`)
}

export const getDeliveries = (params) => {
  return request.get('/deliveries', { params })
}

export const getDeliveryDetail = (id) => {
  return request.get(`/deliveries/${id}`)
}

export const createDelivery = (data) => {
  return request.post('/deliveries', data)
}

export const updateDelivery = (id, data) => {
  return request.put(`/deliveries/${id}`, data)
}

export const updateDeliveryStatus = (id, status) => {
  return request.put(`/deliveries/${id}/status`, { status })
}

export const deleteDelivery = (id) => {
  return request.delete(`/deliveries/${id}`)
}
