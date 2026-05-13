import request from '@/utils/request'

export const createPrivateCourse = (data) => request.post('/private-courses', data)

export const getPrivateCoursePage = (params) => request.get('/private-courses', { params })

export const getPrivateCoursesByUserId = (userId) => request.get(`/private-courses/user/${userId}`)

export const createPrivateSchedule = (data) => request.post('/private-courses/schedules', data)

export const getPrivateSchedulePage = (params) => request.get('/private-courses/schedules', { params })

export const getPrivateScheduleById = (id) => request.get(`/private-courses/schedules/${id}`)

export const cancelPrivateSchedule = (id) => request.put(`/private-courses/schedules/${id}/cancel`)

export const checkInPrivateSchedule = (id) => request.post(`/private-courses/schedules/${id}/check-in`)
