import request from '@/utils/request'

export const login = (data) => request.post('/auth/login', data)

export const register = (data) => request.post('/auth/register', data)

export const getRoles = () => request.get('/auth/roles')

export const getUserPage = (params) => request.get('/users', { params })

export const getUserById = (id) => request.get(`/users/${id}`)

export const createUser = (data) => request.post('/users', data)

export const updateUser = (id, data) => request.put(`/users/${id}`, data)

export const deleteUser = (id) => request.delete(`/users/${id}`)

export const updateUserStatus = (id, status) => request.put(`/users/${id}/status?status=${status}`)

export const getCoaches = () => request.get('/users/coaches')

export const getMembers = () => request.get('/users/members')
