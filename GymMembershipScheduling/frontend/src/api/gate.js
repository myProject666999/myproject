import request from '@/utils/request'

export const gateAccess = (data) => request.post('/gate/access', data)

export const getGateRecords = (params) => request.get('/gate/records', { params })
