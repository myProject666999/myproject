import request from '@/utils/request'

export const getDepartments = () => request.get('/departments')

export const getDepartmentById = (id) => request.get(`/departments/${id}`)

export const getDoctors = (departmentId) => request.get('/doctors', { params: { departmentId } })

export const getDoctorById = (id) => request.get(`/doctors/${id}`)

export const getSchedules = (params) => request.get('/schedules', { params })

export const getScheduleById = (id) => request.get(`/schedules/${id}`)

export const createAppointment = (data) => request.post('/appointments', data)

export const getAppointmentsByPatient = (patientId) => request.get(`/appointments/patient/${patientId}`)

export const getAppointmentById = (id) => request.get(`/appointments/${id}`)

export const cancelAppointment = (id, reason) => request.put(`/appointments/${id}/cancel`, { reason })

export const getQueueCalls = (params) => request.get('/queue-calls', { params })

export const getCurrentCalling = (params) => request.get('/queue-calls/current', { params })

export const callNext = (data) => request.post('/queue-calls/call-next', data)

export const recallQueue = (id) => request.put(`/queue-calls/${id}/recall`)

export const markVisited = (id) => request.put(`/queue-calls/${id}/visited`)

export const markMissed = (id) => request.put(`/queue-calls/${id}/missed`)
