import request from '../utils/request'

export const getSubscriptions = () => request.get('/subscriptions')
export const getActiveSubscriptions = () => request.get('/subscriptions/active')
export const getSubscriptionById = (id) => request.get(`/subscriptions/${id}`)
export const createSubscription = (data) => request.post('/subscriptions', data)
export const updateSubscription = (id, data) => request.put(`/subscriptions/${id}`, data)
export const deleteSubscription = (id) => request.delete(`/subscriptions/${id}`)
export const getUpcomingRenewals = (days) => request.get(`/subscriptions/upcoming/${days}`)
export const getCategories = () => request.get('/subscriptions/categories')
export const renewSubscription = (id) => request.post(`/subscriptions/${id}/renew`)

export const getPendingReminders = () => request.get('/reminders/pending')
export const markReminderSent = (id) => request.put(`/reminders/${id}/sent`)
export const generateReminders = () => request.post('/reminders/generate')

export const getStatistics = () => request.get('/statistics')

export const getExchangeRates = () => request.get('/exchange-rates')
