import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { username: string; password: string; nickname: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadAvatar: (formData: FormData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getUserById: (id: number) => api.get(`/users/${id}`),
  getUserStats: (id: number) => api.get(`/users/${id}/stats`),
};

export const groupApi = {
  getGroups: (params?: any) => api.get('/groups', { params }),
  getGroupDetail: (id: number) => api.get(`/groups/${id}`),
  createGroup: (data: any) => api.post('/groups', data),
  joinGroup: (id: number) => api.post(`/groups/${id}/join`),
  leaveGroup: (id: number) => api.post(`/groups/${id}/leave`),
  getUserGroups: () => api.get('/groups/my'),
};

export const checkinApi = {
  checkin: (groupId: number, data: any) => api.post(`/checkins/group/${groupId}`, data),
  getMyCheckins: (params?: any) => api.get('/checkins/mine', { params }),
  getGroupCheckins: (groupId: number, params?: any) =>
    api.get(`/checkins/group/${groupId}`, { params }),
  getUserCheckins: (userId: number, params?: any) =>
    api.get(`/checkins/user/${userId}`, { params }),
  hasCheckedInToday: (groupId: number) =>
    api.get(`/checkins/today/group/${groupId}`),
  getCheckinStats: () => api.get('/checkins/stats'),
};

export const postApi = {
  getPosts: (params?: any) => api.get('/posts', { params }),
  getFeed: (params?: any) => api.get('/posts/feed', { params }),
  getPostDetail: (id: number) => api.get(`/posts/${id}`),
  createPost: (data: any) => api.post('/posts', data),
  commentPost: (id: number, data: any) => api.post(`/posts/${id}/comments`, data),
  likePost: (id: number) => api.post(`/posts/${id}/like`),
  deletePost: (id: number) => api.delete(`/posts/${id}`),
  hasLiked: (id: number) => api.get(`/posts/${id}/has-liked`),
};

export const goalApi = {
  createGoal: (data: any) => api.post('/goals', data),
  getMyGoals: (params?: any) => api.get('/goals/mine', { params }),
  getUserGoals: (userId: number) => api.get(`/goals/user/${userId}`),
  getGroupGoals: (groupId: number) => api.get(`/goals/group/${groupId}`),
  updateProgress: (id: number, data: any) => api.put(`/goals/${id}/progress`, data),
  updateStatus: (id: number, data: any) => api.put(`/goals/${id}/status`, data),
  deleteGoal: (id: number) => api.delete(`/goals/${id}`),
};

export const rankingApi = {
  getGroupRanking: (groupId: number, params?: any) =>
    api.get(`/rankings/group/${groupId}`, { params }),
  getGroupStreakRanking: (groupId: number, params?: any) =>
    api.get(`/rankings/group/${groupId}/streak`, { params }),
  getGlobalRanking: (params?: any) => api.get('/rankings/global', { params }),
  getMyRank: () => api.get('/rankings/my-rank'),
  getMyGroupRank: (groupId: number) => api.get(`/rankings/group/${groupId}/my-rank`),
};

export const notificationApi = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
};

export default api;
