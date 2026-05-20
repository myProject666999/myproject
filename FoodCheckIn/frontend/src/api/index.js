import request from '@/utils/request'

export const restaurantApi = {
  list: () => request.get('/restaurants'),
  detail: (id) => request.get(`/restaurants/${id}`),
  add: (data) => request.post('/restaurants', data),
  update: (data) => request.put('/restaurants', data),
  delete: (id) => request.delete(`/restaurants/${id}`),
  getDishes: (restaurantId) => request.get(`/restaurants/${restaurantId}/dishes`),
  addDish: (data) => request.post('/restaurants/dishes', data),
  updateDish: (data) => request.put('/restaurants/dishes', data),
  deleteDish: (id) => request.delete(`/restaurants/dishes/${id}`)
}

export const checkinApi = {
  create: (data) => request.post('/checkins', data),
  detail: (id) => request.get(`/checkins/${id}`),
  list: (page = 1, size = 10) => request.get('/checkins', { params: { page, size } }),
  delete: (id) => request.delete(`/checkins/${id}`),
  monthReview: (year, month) => request.get('/checkins/month-review', { params: { year, month } })
}

export const mapApi = {
  getRestaurants: () => request.get('/map/restaurants')
}
