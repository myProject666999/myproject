import request from '../utils/request'

export const dashboardApi = {
  getOverview: () => request.get('/dashboard/overview'),
  getTrend: (days: number = 30) => request.get(`/dashboard/trend?days=${days}`),
  getDueReminders: () => request.get('/dashboard/due-reminders')
}

export const receivableApi = {
  getList: (params?: any) => request.get('/receivables', { params }),
  create: (data: any) => request.post('/receivables', data),
  update: (id: number, data: any) => request.put(`/receivables/${id}`, data),
  delete: (id: number) => request.delete(`/receivables/${id}`)
}

export const payableApi = {
  getList: (params?: any) => request.get('/payables', { params }),
  create: (data: any) => request.post('/payables', data),
  update: (id: number, data: any) => request.put(`/payables/${id}`, data),
  delete: (id: number) => request.delete(`/payables/${id}`)
}

export const forecastApi = {
  getForecast: (days: number = 30) => request.get(`/cashflow/forecast?days=${days}`),
  simulate: (data: any) => request.post('/cashflow/simulate', data)
}

export const warningApi = {
  getThreshold: () => request.get('/warning/threshold'),
  updateThreshold: (data: any) => request.put('/warning/threshold', data),
  getActiveWarnings: () => request.get('/warning/active'),
  getHistory: () => request.get('/warning/history'),
  getTimeline: () => request.get('/warning/timeline')
}

export const reportApi = {
  getList: (params?: any) => request.get('/daily-reports', { params }),
  getDetail: (date: string) => request.get(`/daily-reports/${date}`),
  export: (date: string) => request.get(`/daily-reports/${date}/export`, { responseType: 'blob' })
}
