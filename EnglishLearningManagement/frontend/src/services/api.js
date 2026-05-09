import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  activate: (token) => api.get(`/auth/activate?token=${token}`),
  getCurrentUser: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/profile', data),
  updatePassword: (data) => api.put('/user/password', data),
};

export const announcementAPI = {
  getAll: () => api.get('/announcements'),
  getLatest: () => api.get('/announcements/latest'),
  getById: (id) => api.get(`/announcements/${id}`),
};

export const dailySentenceAPI = {
  getRandom: () => api.get('/daily-sentence'),
  getAll: () => api.get('/daily-sentences'),
};

export const wordAPI = {
  getByLevel: (level) => api.get(`/words/${level}`),
  getRandom: (level) => api.get(`/words/random/${level}`),
  updateStatus: (id, action) => api.post(`/words/${id}/status`, { action }),
  getFavorites: () => api.get('/favorites/words'),
  getProgress: () => api.get('/progress/learning'),
};

export const listeningAPI = {
  getAll: (params) => api.get('/listening', { params }),
  getById: (id) => api.get(`/listening/${id}`),
  getYears: (level) => api.get('/listening/years', { params: { level } }),
};

export const bookAPI = {
  getAll: (level) => api.get('/books', { params: { level } }),
  getById: (id) => api.get(`/books/${id}`),
  updateProgress: (id, page) => api.post(`/books/${id}/progress`, { current_page: page }),
  getProgress: () => api.get('/progress/reading'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetUserPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  createWord: (data) => api.post('/admin/words', data),
  updateWord: (id, data) => api.put(`/admin/words/${id}`, data),
  deleteWord: (id) => api.delete(`/admin/words/${id}`),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  createBook: (data) => api.post('/admin/books', data),
  updateBook: (id, data) => api.put(`/admin/books/${id}`, data),
  deleteBook: (id) => api.delete(`/admin/books/${id}`),
};

export default api;
