import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import type { ApiResponse } from '../types'

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message: msg, data } = response.data

    if (code === 200) {
      return { ...response, data } as any
    }

    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      message.error(data?.message || '请求失败')
    } else {
      message.error('网络错误，请稍后重试')
    }

    return Promise.reject(error)
  }
)

export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.get(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    instance.post(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    instance.put(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.delete(url, config),
}

export const authAPI = {
  login: (data: { username: string; password: string }) =>
    api.post('/login', data),
  getCurrentUser: () => api.get('/user/me'),
}

export const adminAPI = {
  getRoles: () => api.get('/common/roles'),
  getDepartments: () => api.get('/common/departments'),
  getRegistrationLevels: () => api.get('/common/registration-levels'),
  getSettlementCategories: () => api.get('/common/settlement-categories'),

  getUsers: (params?: any) => api.get('/admin/users', { params }),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  createDepartment: (data: any) => api.post('/admin/departments', data),
  updateDepartment: (id: number, data: any) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id: number) => api.delete(`/admin/departments/${id}`),

  createRegistrationLevel: (data: any) => api.post('/admin/registration-levels', data),
  updateRegistrationLevel: (id: number, data: any) => api.put(`/admin/registration-levels/${id}`, data),
  deleteRegistrationLevel: (id: number) => api.delete(`/admin/registration-levels/${id}`),

  createSettlementCategory: (data: any) => api.post('/admin/settlement-categories', data),
  updateSettlementCategory: (id: number, data: any) => api.put(`/admin/settlement-categories/${id}`, data),
  deleteSettlementCategory: (id: number) => api.delete(`/admin/settlement-categories/${id}`),

  getDiagnosisCatalogs: (params?: any) => api.get('/admin/diagnosis-catalogs', { params }),
  createDiagnosisCatalog: (data: any) => api.post('/admin/diagnosis-catalogs', data),
  updateDiagnosisCatalog: (id: number, data: any) => api.put(`/admin/diagnosis-catalogs/${id}`, data),
  deleteDiagnosisCatalog: (id: number) => api.delete(`/admin/diagnosis-catalogs/${id}`),

  getChargeItems: (params?: any) => api.get('/admin/charge-items', { params }),
  createChargeItem: (data: any) => api.post('/admin/charge-items', data),
  updateChargeItem: (id: number, data: any) => api.put(`/admin/charge-items/${id}`, data),
  deleteChargeItem: (id: number) => api.delete(`/admin/charge-items/${id}`),

  getMedicines: (params?: any) => api.get('/admin/medicines', { params }),
  createMedicine: (data: any) => api.post('/admin/medicines', data),
  updateMedicine: (id: number, data: any) => api.put(`/admin/medicines/${id}`, data),
  deleteMedicine: (id: number) => api.delete(`/admin/medicines/${id}`),

  getExpenseSubjects: () => api.get('/admin/expense-subjects'),
  createExpenseSubject: (data: any) => api.post('/admin/expense-subjects', data),
  updateExpenseSubject: (id: number, data: any) => api.put(`/admin/expense-subjects/${id}`, data),
  deleteExpenseSubject: (id: number) => api.delete(`/admin/expense-subjects/${id}`),

  getDoctorSchedules: (params?: any) => api.get('/admin/doctor-schedules', { params }),
  createDoctorSchedule: (data: any) => api.post('/admin/doctor-schedules', data),
  updateDoctorSchedule: (id: number, data: any) => api.put(`/admin/doctor-schedules/${id}`, data),
  deleteDoctorSchedule: (id: number) => api.delete(`/admin/doctor-schedules/${id}`),
}

export const doctorAPI = {
  getWaitingList: (params?: any) => api.get('/doctor/waiting-list', { params }),
  getRegistrationDetail: (id: number) => api.get(`/doctor/registrations/${id}`),
  startDiagnosis: (id: number) => api.post(`/doctor/registrations/${id}/start`),
  finishDiagnosis: (id: number) => api.post(`/doctor/registrations/${id}/finish`),

  getMedicalRecord: (params?: any) => api.get('/doctor/medical-records', { params }),
  saveMedicalRecord: (data: any) => api.post('/doctor/medical-records', data),

  createExaminationRequest: (data: any) => api.post('/doctor/examination-requests', data),
  createLaboratoryRequest: (data: any) => api.post('/doctor/laboratory-requests', data),
  createTreatmentRequest: (data: any) => api.post('/doctor/treatment-requests', data),
  createPrescription: (data: any) => api.post('/doctor/prescriptions', data),
  getPrescriptions: (params?: any) => api.get('/doctor/prescriptions', { params }),

  getPatientFees: (params?: any) => api.get('/doctor/patient-fees', { params }),

  searchMedicines: (params?: any) => api.get('/doctor/search/medicines', { params }),
  searchDiagnosis: (params?: any) => api.get('/doctor/search/diagnosis', { params }),
  searchChargeItems: (params?: any) => api.get('/doctor/search/charge-items', { params }),

  confirmDiagnosis: (data: any) => api.post('/doctor/confirm-diagnosis', data),
}

export const receptionAPI = {
  searchPatients: (params?: any) => api.get('/reception/patients/search', { params }),
  createPatient: (data: any) => api.post('/reception/patients', data),
  getPatientByID: (id: number) => api.get(`/reception/patients/${id}`),

  getAvailableSchedules: (params?: any) => api.get('/reception/schedules', { params }),
  createRegistration: (data: any) => api.post('/reception/registrations', data),
  getRegistrations: (params?: any) => api.get('/reception/registrations', { params }),
  cancelRegistration: (id: number) => api.post(`/reception/registrations/${id}/cancel`),

  getPatientFees: (params?: any) => api.get('/reception/patient-fees', { params }),
  chargeFees: (data: any) => api.post('/reception/charge-fees', data),
}

export const pharmacyAPI = {
  getPendingPrescriptions: () => api.get('/pharmacy/prescriptions/pending'),
  getPrescriptionDetail: (id: number) => api.get(`/pharmacy/prescriptions/${id}`),
  dispensePrescription: (id: number) => api.post(`/pharmacy/prescriptions/${id}/dispense`),
  returnPrescription: (id: number) => api.post(`/pharmacy/prescriptions/${id}/return`),
  getMedicineStock: () => api.get('/pharmacy/medicine-stock'),
}

export const statisticsAPI = {
  getWorkloadStatistics: (params?: any) => api.get('/statistics/workload', { params }),
  getDailySettlements: (params?: any) => api.get('/statistics/daily-settlements', { params }),
  createDailySettlement: () => api.post('/statistics/daily-settlement'),
  getTodayOverview: () => api.get('/statistics/today-overview'),
}
