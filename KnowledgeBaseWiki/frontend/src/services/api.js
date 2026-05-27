import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'userId': 1
  }
});

export const spaceApi = {
  getMySpaces: () => api.get('/spaces/my'),
  getPublicSpaces: () => api.get('/spaces/public'),
  getSpace: (id) => api.get(`/spaces/${id}`),
  createSpace: (data) => api.post('/spaces', data),
  updateSpace: (id, data) => api.put(`/spaces/${id}`, data),
  deleteSpace: (id) => api.delete(`/spaces/${id}`),
  getMembers: (id) => api.get(`/spaces/${id}/members`),
  addMember: (id, userId, role) => api.post(`/spaces/${id}/members?userId=${userId}&role=${role}`),
  removeMember: (id, userId) => api.delete(`/spaces/${id}/members/${userId}`)
};

export const documentApi = {
  getTree: (spaceId) => api.get(`/documents/tree/${spaceId}`),
  getChildren: (spaceId, parentId) => api.get(`/documents/children/${spaceId}?parentId=${parentId}`),
  getDocument: (id) => api.get(`/documents/${id}`),
  createDocument: (data) => api.post('/documents', data),
  updateDocument: (id, data, editSummary) => api.put(`/documents/${id}?editSummary=${editSummary || ''}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  restoreDocument: (id) => api.post(`/documents/${id}/restore`),
  search: (keyword) => api.get(`/documents/search?keyword=${keyword}`),
  getVersions: (id) => api.get(`/documents/${id}/versions`),
  getVersion: (id, version) => api.get(`/documents/${id}/versions/${version}`),
  getRecycled: (spaceId) => api.get(`/documents/recycle/${spaceId}`)
};

export default api;
