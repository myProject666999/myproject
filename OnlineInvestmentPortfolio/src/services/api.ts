import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data)
};

export const stockAPI = {
  search: (query: string) =>
    api.get(`/stock/search?q=${encodeURIComponent(query)}`),
  getStock: (symbol: string) =>
    api.get(`/stock/${symbol}`),
  getHistory: (symbol: string, days?: number) =>
    api.get(`/stock/${symbol}/history${days ? `?days=${days}` : ''}`)
};

export const watchlistAPI = {
  getAll: () => api.get('/watchlist'),
  add: (symbol: string) => api.post('/watchlist', { symbol }),
  remove: (symbol: string) => api.delete(`/watchlist/${symbol}`)
};

export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  buy: (data: { symbol: string; shares: number; price: number }) =>
    api.post('/portfolio/buy', data),
  sell: (data: { symbol: string; shares: number; price: number }) =>
    api.post('/portfolio/sell', data),
  getTransactions: (page?: number, pageSize?: number) =>
    api.get('/portfolio/transactions', { params: { page, pageSize } })
};

export const performanceAPI = {
  getPerformance: (days?: number) =>
    api.get('/performance', { params: { days } })
};

export const alertAPI = {
  getAll: () => api.get('/alerts'),
  create: (data: { symbol: string; type: string; threshold: number }) =>
    api.post('/alerts', data),
  update: (id: number, data: { enabled?: boolean; threshold?: number }) =>
    api.put(`/alerts/${id}`, data),
  delete: (id: number) => api.delete(`/alerts/${id}`)
};

export default api;
