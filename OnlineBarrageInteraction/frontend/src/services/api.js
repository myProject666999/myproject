import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['X-User-ID'] = userId;
  }
  const adminId = localStorage.getItem('adminId');
  if (adminId) {
    config.headers['Authorization'] = adminId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const userApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  adminLogin: (data) => api.post('/admin/login', data),
  getUsers: () => api.get('/users'),
};

export const messageApi = {
  create: (data) => api.post('/messages', data),
  getAll: (params) => api.get('/messages', { params }),
  getPending: () => api.get('/messages/pending'),
  approve: (id) => api.put(`/messages/${id}/approve`),
  reject: (id) => api.put(`/messages/${id}/reject`),
};

export const likeApi = {
  like: (messageId, data) => api.post(`/likes/${messageId}`, data),
  unlike: (messageId, data) => api.delete(`/likes/${messageId}`, { data }),
};

export const lotteryApi = {
  create: (data) => api.post('/lottery', data),
  getAll: () => api.get('/lottery'),
  getById: (id) => api.get(`/lottery/${id}`),
  draw: (id) => api.post(`/lottery/${id}/draw`),
  getWinners: (id) => api.get(`/lottery/${id}/winners`),
};

export default api;
