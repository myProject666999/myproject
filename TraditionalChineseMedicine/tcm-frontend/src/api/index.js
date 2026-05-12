import request from '../utils/request'

export const patientApi = {
  list: (keyword) => request({ url: '/patients', params: { keyword } }),
  get: (id) => request({ url: `/patients/${id}` }),
  save: (data) => request({ url: '/patients', method: 'post', data }),
  update: (data) => request({ url: '/patients', method: 'put', data }),
  delete: (id) => request({ url: `/patients/${id}`, method: 'delete' })
}

export const diagnosisApi = {
  list: (patientId) => request({ url: `/diagnosis/patient/${patientId}` }),
  get: (id) => request({ url: `/diagnosis/${id}` }),
  save: (data) => request({ url: '/diagnosis', method: 'post', data }),
  update: (data) => request({ url: '/diagnosis', method: 'put', data }),
  delete: (id) => request({ url: `/diagnosis/${id}`, method: 'delete' })
}

export const herbApi = {
  list: (keyword, category) => request({ url: '/herbs', params: { keyword, category } }),
  get: (id) => request({ url: `/herbs/${id}` }),
  getByName: (name) => request({ url: `/herbs/name/${name}` }),
  save: (data) => request({ url: '/herbs', method: 'post', data }),
  update: (data) => request({ url: '/herbs', method: 'put', data }),
  delete: (id) => request({ url: `/herbs/${id}`, method: 'delete' })
}

export const inventoryApi = {
  list: (herbId) => request({ url: '/inventory', params: { herbId } }),
  get: (id) => request({ url: `/inventory/${id}` }),
  save: (data) => request({ url: '/inventory', method: 'post', data }),
  update: (data) => request({ url: '/inventory', method: 'put', data }),
  delete: (id) => request({ url: `/inventory/${id}`, method: 'delete' })
}

export const templateApi = {
  list: (keyword, category, isClassic) => request({ url: '/templates', params: { keyword, category, isClassic } }),
  get: (id) => request({ url: `/templates/${id}` }),
  getHerbs: (id) => request({ url: `/templates/${id}/herbs` }),
  save: (data) => request({ url: '/templates', method: 'post', data }),
  update: (data) => request({ url: '/templates', method: 'put', data }),
  delete: (id) => request({ url: `/templates/${id}`, method: 'delete' })
}

export const prescriptionApi = {
  checkConflict: (herbNames) => request({ url: '/prescriptions/check-conflict', params: { herbNames } }),
  list: (patientId) => request({ url: `/prescriptions/patient/${patientId}` }),
  get: (id) => request({ url: `/prescriptions/${id}` }),
  save: (data) => request({ url: '/prescriptions', method: 'post', data }),
  update: (data) => request({ url: '/prescriptions', method: 'put', data }),
  updateStatus: (id, status) => request({ url: `/prescriptions/${id}/status/${status}`, method: 'put' }),
  delete: (id) => request({ url: `/prescriptions/${id}`, method: 'delete' })
}

export const decoctionApi = {
  list: (status) => request({ url: '/decoction', params: { status } }),
  get: (id) => request({ url: `/decoction/${id}` }),
  getByPrescription: (prescriptionId) => request({ url: `/decoction/prescription/${prescriptionId}` }),
  save: (data) => request({ url: '/decoction', method: 'post', data }),
  update: (data) => request({ url: '/decoction', method: 'put', data }),
  start: (id) => request({ url: `/decoction/${id}/start`, method: 'put' }),
  complete: (id) => request({ url: `/decoction/${id}/complete`, method: 'put' }),
  pickup: (id) => request({ url: `/decoction/${id}/pickup`, method: 'put' }),
  delete: (id) => request({ url: `/decoction/${id}`, method: 'delete' })
}

export const followupApi = {
  list: (patientId) => request({ url: `/followup/patient/${patientId}` }),
  get: (id) => request({ url: `/followup/${id}` }),
  save: (data) => request({ url: '/followup', method: 'post', data }),
  update: (data) => request({ url: '/followup', method: 'put', data }),
  delete: (id) => request({ url: `/followup/${id}`, method: 'delete' })
}
