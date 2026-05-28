import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
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
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  profile: () => api.get('/user/profile'),
};

export const templateApi = {
  list: (params?: { page?: number; limit?: number; category?: string }) =>
    api.get('/templates', { params }),
  get: (id: number) => api.get(`/templates/${id}`),
  create: (data: FormData) =>
    api.post('/templates', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const memeApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/memes', { params }),
  get: (id: number) => api.get(`/memes/${id}`),
  create: (data: FormData) =>
    api.post('/memes', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  like: (id: number) => api.post(`/memes/${id}/like`),
  unlike: (id: number) => api.delete(`/memes/${id}/like`),
};

export const hotlistApi = {
  get: (params?: { limit?: number; period?: string }) =>
    api.get('/hotlist', { params }),
};

export const reviewApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/review', { params }),
  approve: (id: number) => api.post(`/review/${id}/approve`),
  reject: (id: number, reason: string) =>
    api.post(`/review/${id}/reject`, { reason }),
};

export const stickerApi = {
  list: (params?: { category?: string }) => api.get('/stickers', { params }),
};

export default api;
