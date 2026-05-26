import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
};

export const spacesApi = {
  list: () => api.get('/spaces'),
  get: (id: number) => api.get(`/spaces/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/spaces', data),
  update: (id: number, data: any) => api.put(`/spaces/${id}`, data),
  delete: (id: number) => api.delete(`/spaces/${id}`),
  getMembers: (id: number) => api.get(`/spaces/${id}/members`),
  addMember: (id: number, data: { user_id: number; role: number }) =>
    api.post(`/spaces/${id}/members`, data),
  updateMember: (id: number, userId: number, role: number) =>
    api.put(`/spaces/${id}/members/${userId}`, { role }),
  removeMember: (id: number, userId: number) =>
    api.delete(`/spaces/${id}/members/${userId}`),
};

export const documentsApi = {
  list: (spaceId: number) => api.get(`/documents/space/${spaceId}`),
  get: (id: number) => api.get(`/documents/${id}`),
  create: (data: { space_id: number; title: string; content?: string; parent_id?: number }) =>
    api.post('/documents', data),
  update: (id: number, data: { title?: string; content?: string }) =>
    api.put(`/documents/${id}`, data),
  delete: (id: number) => api.delete(`/documents/${id}`),
  restore: (id: number) => api.post(`/documents/${id}/restore`),
  permanentDelete: (id: number) => api.delete(`/documents/${id}/permanent`),
  deletedList: (spaceId: number) => api.get(`/documents/deleted/${spaceId}`),
};

export const commentsApi = {
  list: (documentId: number) => api.get(`/comments/document/${documentId}`),
  create: (data: { document_id: number; content: string; parent_id?: number; mentions?: number[] }) =>
    api.post('/comments', data),
  update: (id: number, content: string) => api.put(`/comments/${id}`, { content }),
  delete: (id: number) => api.delete(`/comments/${id}`),
  resolve: (id: number) => api.post(`/comments/${id}/resolve`),
  unresolve: (id: number) => api.post(`/comments/${id}/unresolve`),
};

export const recycleBinApi = {
  list: (spaceId: number) => api.get(`/recycle-bin/space/${spaceId}`),
  restore: (id: number) => api.post(`/recycle-bin/${id}/restore`),
  delete: (id: number) => api.delete(`/recycle-bin/${id}`),
};

export default api;
