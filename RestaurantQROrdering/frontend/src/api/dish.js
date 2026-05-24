import request from './request'

export const getCategories = (all = false) => request.get('/dishes/categories', { params: { all } })

export const getDishesByCategory = (categoryId) => request.get(`/dishes/category/${categoryId}`)

export const getAllDishes = () => request.get('/dishes')

export const getDishById = (id) => request.get(`/dishes/${id}`)

export const createCategory = (data) => request.post('/dishes/categories', data)

export const updateCategory = (id, data) => request.put(`/dishes/categories/${id}`, data)

export const deleteCategory = (id) => request.delete(`/dishes/categories/${id}`)

export const createDish = (data) => request.post('/dishes', data)

export const updateDish = (id, data) => request.put(`/dishes/${id}`, data)

export const deleteDish = (id) => request.delete(`/dishes/${id}`)
