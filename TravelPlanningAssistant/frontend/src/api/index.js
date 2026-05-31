import request from './request'

export const tripApi = {
  getTrips: () => request.get('/trips'),
  getTrip: (id) => request.get(`/trips/${id}`),
  createTrip: (data) => request.post('/trips', data),
  updateTrip: (id, data) => request.put(`/trips/${id}`, data),
  deleteTrip: (id) => request.delete(`/trips/${id}`),
  getTripMapData: (id) => request.get(`/trips/${id}/map`),
  getShareLink: (id) => request.get(`/trips/${id}/share`),
  getSharedTrip: (token) => request.get(`/share/${token}`)
}

export const dayApi = {
  getDays: (tripId) => request.get(`/trips/${tripId}/days`),
  createDay: (tripId, data) => request.post(`/trips/${tripId}/days`, data),
  updateDay: (id, data) => request.put(`/days/${id}`, data),
  deleteDay: (id) => request.delete(`/days/${id}`)
}

export const attractionApi = {
  getAttractions: (dayId) => request.get(`/days/${dayId}/attractions`),
  getAllAttractions: () => request.get('/attractions'),
  getAttraction: (id) => request.get(`/attractions/${id}`),
  createAttraction: (dayId, data) => request.post(`/days/${dayId}/attractions`, data),
  updateAttraction: (id, data) => request.put(`/attractions/${id}`, data),
  deleteAttraction: (id) => request.delete(`/attractions/${id}`)
}

export const budgetApi = {
  getBudgets: (tripId) => request.get(`/trips/${tripId}/budgets`),
  getBudgetSummary: (tripId) => request.get(`/trips/${tripId}/budgets/summary`),
  createBudget: (tripId, data) => request.post(`/trips/${tripId}/budgets`, data),
  updateBudget: (id, data) => request.put(`/budgets/${id}`, data),
  deleteBudget: (id) => request.delete(`/budgets/${id}`)
}
