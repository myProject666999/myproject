import request from '@/utils/request'

export const getCourseTypes = () => request.get('/group-classes/types')

export const createSchedule = (data) => request.post('/group-classes/schedules', data)

export const getSchedulePage = (params) => request.get('/group-classes/schedules', { params })

export const getScheduleById = (id) => request.get(`/group-classes/schedules/${id}`)

export const cancelSchedule = (id) => request.put(`/group-classes/schedules/${id}/cancel`)

export const bookClass = (id, userId) => request.post(`/group-classes/schedules/${id}/book?userId=${userId}`)

export const cancelBooking = (id) => request.post(`/group-classes/bookings/${id}/cancel`)

export const getMyBookings = (params) => request.get('/group-classes/bookings/my', { params })

export const checkInBooking = (id) => request.post(`/group-classes/bookings/${id}/check-in`)
