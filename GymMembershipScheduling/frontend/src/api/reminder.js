import request from '@/utils/request'

export const getReminders = (params) => request.get('/renewal-reminders', { params })

export const markAsSent = (id) => request.put(`/renewal-reminders/${id}/sent`)

export const generateReminders = () => request.post('/renewal-reminders/generate')
