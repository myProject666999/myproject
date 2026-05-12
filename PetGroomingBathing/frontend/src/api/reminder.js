import request from '@/utils/request'

export const getReminders = (params) => {
  return request.get('/reminders', { params })
}

export const getUpcomingReminders = (days) => {
  return request.get('/reminders/upcoming', { params: { days } })
}

export const getReminder = (id) => {
  return request.get(`/reminders/${id}`)
}

export const createReminder = (data) => {
  return request.post('/reminders', data)
}

export const updateReminder = (id, data) => {
  return request.patch(`/reminders/${id}`, data)
}

export const deleteReminder = (id) => {
  return request.delete(`/reminders/${id}`)
}
