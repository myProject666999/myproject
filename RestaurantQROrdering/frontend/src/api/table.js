import request from './request'

export const getAllTables = () => request.get('/tables')

export const getTableById = (id) => request.get(`/tables/${id}`)

export const getTableByNo = (tableNo) => request.get(`/tables/no/${tableNo}`)

export const bindTable = (tableNo) => request.post(`/tables/bind/${tableNo}`)

export const unbindTable = () => request.post('/tables/unbind')

export const getCurrentTable = () => request.get('/tables/current')

export const createTable = (data) => request.post('/tables', data)

export const updateTable = (id, data) => request.put(`/tables/${id}`, data)

export const deleteTable = (id) => request.delete(`/tables/${id}`)
