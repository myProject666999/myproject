import request from '@/utils/request'

export const getCardTypes = () => request.get('/membership-cards/types')

export const purchaseCard = (data) => request.post('/membership-cards/purchase', data)

export const getCardPage = (params) => request.get('/membership-cards', { params })

export const getCardById = (id) => request.get(`/membership-cards/${id}`)

export const getCardsByUserId = (userId) => request.get(`/membership-cards/user/${userId}`)

export const renewCard = (id, data) => request.post(`/membership-cards/${id}/renew`, null, { params: data })

export const updateCardStatus = (id, status) => request.put(`/membership-cards/${id}/status?status=${status}`)
