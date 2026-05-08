import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
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
  (response) => {
    const res = response.data;
    if (res.code === 200) {
      return res;
    } else {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        message.error('没有权限访问');
      } else if (status === 500) {
        message.error('服务器错误');
      } else {
        message.error(error.response.data?.message || '请求失败');
      }
    } else {
      message.error('网络错误');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/password', data),
  getMyPoints: () => api.get('/user/points'),
};

export const activityApi = {
  getList: (params) => api.get('/activities', { params }),
  getDetail: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  register: (id) => api.post(`/activities/${id}/register`),
  cancel: (id) => api.post(`/activities/${id}/cancel`),
  getMyActivities: (params) => api.get('/my-activities', { params }),
  getComments: (id) => api.get(`/activities/${id}/comments`),
  createComment: (id, data) => api.post(`/activities/${id}/comments`, data),
};

export const carouselApi = {
  getList: () => api.get('/carousels'),
  getAll: () => api.get('/carousels/all'),
  create: (data) => api.post('/carousels', data),
  update: (id, data) => api.put(`/carousels/${id}`, data),
  delete: (id) => api.delete(`/carousels/${id}`),
  toggleStatus: (id) => api.put(`/carousels/${id}/status`),
};

export const volunteerApi = {
  getList: (params) => api.get('/volunteers', { params }),
  getDetail: (id) => api.get(`/volunteers/${id}`),
  getExcellent: () => api.get('/volunteers/excellent'),
  toggleExcellent: (id) => api.put(`/volunteers/${id}/excellent`),
  delete: (id) => api.delete(`/volunteers/${id}`),
  getColleges: () => api.get('/colleges'),
};

export const statsApi = {
  getStats: () => api.get('/stats'),
  getTrend: () => api.get('/stats/trend'),
};

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
