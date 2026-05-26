import axios from 'axios';

const API_BASE = '/api';

const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  config.headers['X-User-Id'] = getUserId();
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || '请求失败');
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
      originalRequest._retry = true;
      return api(originalRequest);
    }
    
    let message = error.response?.data?.message || error.message || '网络错误';
    if (error.code === 'ECONNABORTED') {
      message = '请求超时，请检查网络连接后重试';
    } else if (!error.response) {
      message = '无法连接到服务器，请确认后端服务是否启动';
    }
    
    const userError = new Error(message);
    userError.originalError = error;
    userError.isNetworkError = !error.response;
    throw userError;
  }
);

export const symptomApi = {
  getAll: () => api.get('/symptoms'),
  getCategories: () => api.get('/symptoms/categories'),
  getById: (id) => api.get(`/symptoms/${id}`)
};

export const diseaseApi = {
  getAll: () => api.get('/diseases'),
  getById: (id) => api.get(`/diseases/${id}`)
};

export const consultationApi = {
  analyze: (symptomIds) => api.post('/consultation/analyze', { symptomIds }),
  qaStart: () => api.get('/consultation/qa/start'),
  qaAnswer: (currentQuestionId, answer, questionHistory) =>
    api.post('/consultation/qa/answer', { currentQuestionId, answer, questionHistory })
};

export const articleApi = {
  getAll: (params) => api.get('/articles', { params }),
  getCategories: () => api.get('/articles/categories'),
  getPopular: (limit) => api.get('/articles/popular', { params: { limit } }),
  getById: (id) => api.get(`/articles/${id}`)
};

export const historyApi = {
  getAll: (params) => api.get('/history', { params }),
  getById: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`)
};

export const getDisclaimer = () => api.get('/disclaimer');

export default api;
