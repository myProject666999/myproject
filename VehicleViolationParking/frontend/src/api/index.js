import request from '@/utils/request'

export const login = (username, password) => {
  return request.post('/auth/login', { username, password })
}

export const getUserInfo = () => {
  return request.get('/auth/userinfo')
}

export const getVehicleList = (params) => {
  return request.get('/vehicles', { params })
}

export const getVehicleById = (id) => {
  return request.get(`/vehicles/${id}`)
}

export const getVehicleByPlate = (plate) => {
  return request.get(`/vehicles/plate/${plate}`)
}

export const createVehicle = (data) => {
  return request.post('/vehicles', data)
}

export const updateVehicle = (id, data) => {
  return request.put(`/vehicles/${id}`, data)
}

export const deleteVehicle = (id) => {
  return request.delete(`/vehicles/${id}`)
}

export const updateVehicleStatus = (id, status) => {
  return request.put(`/vehicles/${id}/status`, { status })
}

export const getSpotList = (params) => {
  return request.get('/spots', { params })
}

export const getSpotById = (id) => {
  return request.get(`/spots/${id}`)
}

export const getSpotRealtimeStatus = (params) => {
  return request.get('/spots/realtime/status', { params })
}

export const getSpotStatistics = () => {
  return request.get('/spots/statistics/overview')
}

export const getSpotAreas = () => {
  return request.get('/spots/areas/list')
}

export const createSpot = (data) => {
  return request.post('/spots', data)
}

export const updateSpot = (id, data) => {
  return request.put(`/spots/${id}`, data)
}

export const deleteSpot = (id) => {
  return request.delete(`/spots/${id}`)
}

export const updateSpotStatus = (id, status) => {
  return request.put(`/spots/${id}/status`, { status })
}

export const getRecordList = (params) => {
  return request.get('/records', { params })
}

export const getRecordById = (id) => {
  return request.get(`/records/${id}`)
}

export const getActiveRecordByPlate = (plate) => {
  return request.get(`/records/plate/${plate}/active`)
}

export const calculateFee = (plateNumber) => {
  return request.get('/records/calculate/fee', { params: { plate_number: plateNumber } })
}

export const getRecordStatistics = (params) => {
  return request.get('/records/statistics/overview', { params })
}

export const getRecordTrend = (params) => {
  return request.get('/records/statistics/trend', { params })
}

export const entryVehicle = (data) => {
  return request.post('/records/entry', data)
}

export const exitVehicle = (data) => {
  return request.post('/records/exit', data)
}

export const assignSpot = (data) => {
  return request.post('/records/assign-spot', data)
}

export const payRecord = (id, payMethod) => {
  return request.post(`/records/${id}/pay`, { pay_method: payMethod })
}

export const manualEntry = (data) => {
  return request.post('/records/manual/entry', data)
}

export const manualExit = (data) => {
  return request.post('/records/manual/exit', data)
}

export const getRuleList = (params) => {
  return request.get('/rules', { params })
}

export const getRuleById = (id) => {
  return request.get(`/rules/${id}`)
}

export const createRule = (data) => {
  return request.post('/rules', data)
}

export const updateRule = (id, data) => {
  return request.put(`/rules/${id}`, data)
}

export const deleteRule = (id) => {
  return request.delete(`/rules/${id}`)
}

export const updateRuleStatus = (id, status) => {
  return request.put(`/rules/${id}/status`, { status })
}

export const getCardList = (params) => {
  return request.get('/cards', { params })
}

export const getCardById = (id) => {
  return request.get(`/cards/${id}`)
}

export const getCardByVehicle = (vehicleId) => {
  return request.get(`/cards/vehicle/${vehicleId}`)
}

export const getCardByPlate = (plate) => {
  return request.get(`/cards/plate/${plate}`)
}

export const getCardStatistics = () => {
  return request.get('/cards/statistics/overview')
}

export const getExpiringCards = (params) => {
  return request.get('/cards/expiring/list', { params })
}

export const createCard = (data) => {
  return request.post('/cards', data)
}

export const renewCard = (id, data) => {
  return request.post(`/cards/${id}/renew`, data)
}

export const refundCard = (id) => {
  return request.post(`/cards/${id}/refund`)
}

export const getPaymentList = (params) => {
  return request.get('/payments', { params })
}

export const getPaymentById = (id) => {
  return request.get(`/payments/${id}`)
}

export const getPaymentStatistics = (params) => {
  return request.get('/payments/statistics/overview', { params })
}

export const getDashboardOverview = () => {
  return request.get('/dashboard/overview')
}

export const getRecentRecords = () => {
  return request.get('/dashboard/recent-records')
}

export const getExpiringCardsDashboard = () => {
  return request.get('/dashboard/expiring-cards')
}

export const getSpotUsage = () => {
  return request.get('/dashboard/spot-usage')
}
