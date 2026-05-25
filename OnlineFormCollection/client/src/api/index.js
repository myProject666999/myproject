import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export const formApi = {
  list: () => api.get('/forms'),
  get: (id) => api.get(`/forms/${id}`),
  create: (data) => api.post('/forms', data),
  update: (id, data) => api.put(`/forms/${id}`, data),
  delete: (id) => api.delete(`/forms/${id}`),
  addField: (formId, data) => api.post(`/forms/${formId}/fields`, data),
  updateField: (fieldId, data) => api.put(`/forms/fields/${fieldId}`, data),
  deleteField: (fieldId) => api.delete(`/forms/fields/${fieldId}`),
  reorderFields: (formId, orders) => api.put(`/forms/${formId}/fields/reorder`, { orders })
};

export const submissionApi = {
  list: (formId, params) => api.get(`/submissions/form/${formId}`, { params }),
  submit: (formId, data) => api.post(`/submissions/form/${formId}`, data),
  delete: (id) => api.delete(`/submissions/${id}`)
};

export const exportApi = {
  csv: (formId) => window.open(`/api/export/csv/${formId}`, '_blank'),
  excel: (formId) => window.open(`/api/export/excel/${formId}`, '_blank')
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};

export default api;
