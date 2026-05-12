import request from '../utils/request'

export const login = (data) => request.post('/auth/login', data)
export const register = (data) => request.post('/auth/register', data)

export const getPatients = (params) => request.get('/patients', { params })
export const getPatient = (id) => request.get(`/patients/${id}`)
export const createPatient = (data) => request.post('/patients', data)
export const updatePatient = (data) => request.put('/patients', data)
export const deletePatient = (id) => request.delete(`/patients/${id}`)

export const getDoctors = (clinicId) => request.get('/doctors', { params: { clinicId } })
export const getDoctor = (id) => request.get(`/doctors/${id}`)
export const createDoctor = (data) => request.post('/doctors', data)
export const updateDoctor = (data) => request.put('/doctors', data)
export const deleteDoctor = (id) => request.delete(`/doctors/${id}`)

export const getSchedules = (params) => request.get('/schedules', { params })
export const getDoctorSchedules = (doctorId, date) => request.get(`/schedules/doctor/${doctorId}/date/${date}`)
export const getSchedule = (id) => request.get(`/schedules/${id}`)
export const createSchedule = (data) => request.post('/schedules', data)
export const updateSchedule = (data) => request.put('/schedules', data)
export const deleteSchedule = (id) => request.delete(`/schedules/${id}`)

export const getAppointments = (params) => request.get('/appointments', { params })
export const getPatientAppointments = (patientId) => request.get(`/appointments/patient/${patientId}`)
export const getAppointment = (id) => request.get(`/appointments/${id}`)
export const createAppointment = (data) => request.post('/appointments', data)
export const updateAppointment = (data) => request.put('/appointments', data)
export const cancelAppointment = (id) => request.put(`/appointments/${id}/cancel`)

export const getTreatmentPlans = (params) => request.get('/treatment-plans', { params })
export const getPatientTreatmentPlans = (patientId) => request.get(`/treatment-plans/patient/${patientId}`)
export const getTreatmentPlan = (id) => request.get(`/treatment-plans/${id}`)
export const createTreatmentPlan = (data) => request.post('/treatment-plans', data)
export const updateTreatmentPlan = (data) => request.put('/treatment-plans', data)
export const deleteTreatmentPlan = (id) => request.delete(`/treatment-plans/${id}`)

export const getTreatmentRecords = (params) => request.get('/treatment-records', { params })
export const getPatientTreatmentRecords = (patientId) => request.get(`/treatment-records/patient/${patientId}`)
export const getTreatmentRecord = (id) => request.get(`/treatment-records/${id}`)
export const createTreatmentRecord = (data) => request.post('/treatment-records', data)
export const updateTreatmentRecord = (data) => request.put('/treatment-records', data)
export const deleteTreatmentRecord = (id) => request.delete(`/treatment-records/${id}`)

export const getToothStatus = (patientId) => request.get(`/tooth-status/patient/${patientId}`)
export const createToothStatus = (data) => request.post('/tooth-status', data)
export const updateToothStatus = (data) => request.put('/tooth-status', data)
export const deleteToothStatus = (id) => request.delete(`/tooth-status/${id}`)

export const getMedicalImages = (params) => request.get('/medical-images', { params })
export const getPatientImages = (patientId) => request.get(`/medical-images/patient/${patientId}`)
export const getTreatmentRecordImages = (recordId) => request.get(`/medical-images/treatment-record/${recordId}`)
export const getMedicalImage = (id) => request.get(`/medical-images/${id}`)
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/medical-images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const createMedicalImage = (data) => request.post('/medical-images', data)
export const deleteMedicalImage = (id) => request.delete(`/medical-images/${id}`)

export const getPayments = (params) => request.get('/payments', { params })
export const getPatientPayments = (patientId) => request.get(`/payments/patient/${patientId}`)
export const getPayment = (id) => request.get(`/payments/${id}`)
export const createPayment = (data) => request.post('/payments', data)

export const getReminders = (params) => request.get('/reminders', { params })
export const getPatientReminders = (patientId) => request.get(`/reminders/patient/${patientId}`)
export const getReminder = (id) => request.get(`/reminders/${id}`)
export const createReminder = (data) => request.post('/reminders', data)
export const markReminderRead = (id) => request.put(`/reminders/${id}/read`)
