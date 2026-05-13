import request from '@/utils/request'

export const getPerformanceList = (params) => request.get('/performance', { params })

export const getCommissionRules = () => request.get('/performance/commission-rules')

export const updateCommissionRule = (id, data) => request.put(`/performance/commission-rules/${id}`, data)
