import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const adSpaceApi = {
  getAll: () => api.get('/ad-spaces'),
  getOne: (id: number) => api.get(`/ad-spaces/${id}`),
  create: (data: any) => api.post('/ad-spaces', data),
  update: (id: number, data: any) => api.put(`/ad-spaces/${id}`, data),
  delete: (id: number) => api.delete(`/ad-spaces/${id}`),
};

export const adMaterialApi = {
  getAll: () => api.get('/ad-materials'),
  getOne: (id: number) => api.get(`/ad-materials/${id}`),
  create: (data: any) => api.post('/ad-materials', data),
  update: (id: number, data: any) => api.put(`/ad-materials/${id}`, data),
  delete: (id: number) => api.delete(`/ad-materials/${id}`),
};

export const adScheduleApi = {
  getAll: () => api.get('/ad-schedules'),
  getCurrent: (adSpaceCode?: string) => api.get('/ad-schedules/current', { params: { adSpaceCode } }),
  getOne: (id: number) => api.get(`/ad-schedules/${id}`),
  create: (data: any) => api.post('/ad-schedules', data),
  update: (id: number, data: any) => api.put(`/ad-schedules/${id}`, data),
  delete: (id: number) => api.delete(`/ad-schedules/${id}`),
  recordImpression: (id: number) => api.post(`/ad-schedules/${id}/impression`),
  recordClick: (id: number) => api.post(`/ad-schedules/${id}/click`),
};

export const adStatApi = {
  getAll: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/ad-stats', { params }),
  getSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/ad-stats/summary', { params }),
  getBySchedule: (scheduleId: number, params?: { startDate?: string; endDate?: string }) =>
    api.get(`/ad-stats/schedule/${scheduleId}`, { params }),
};

export default api;
