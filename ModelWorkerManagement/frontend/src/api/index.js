import api from './axios';

export const userAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/password', data),
  getMyPosts: () => api.get('/user/my-posts'),
  getMyFavorites: () => api.get('/user/my-favorites'),
  getMyEnrollments: () => api.get('/user/my-enrollments'),
};

export const loginAPI = userAPI.login;
export const registerAPI = userAPI.register;

export const bannerAPI = {
  getAll: () => api.get('/banners'),
};

export const announcementAPI = {
  getAll: () => api.get('/announcements'),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/admin/announcements', data),
  update: (id, data) => api.put(`/admin/announcements/${id}`, data),
  delete: (id) => api.delete(`/admin/announcements/${id}`),
};

export const trainingAPI = {
  getAll: () => api.get('/trainings'),
  getById: (id) => api.get(`/trainings/${id}`),
  enroll: (id) => api.post(`/trainings/${id}/enroll`),
  create: (data) => api.post('/admin/trainings', data),
  update: (id, data) => api.put(`/admin/trainings/${id}`, data),
  delete: (id) => api.delete(`/admin/trainings/${id}`),
};

export const forumAPI = {
  getAll: () => api.get('/forum'),
  getById: (id) => api.get('/forum/' + id),
  create: (data) => api.post('/forum', data),
  getMyPosts: () => api.get('/user/my-posts'),
  deletePost: (id) => api.delete('/forum/' + id),
};

export const favoriteAPI = {
  getAll: (params) => api.get('/favorites', { params }),
  getMyFavorites: () => api.get('/user/my-favorites'),
  toggleFavorite: (data) => api.post('/favorites/toggle', data),
  create: (data) => api.post('/favorites', data),
  delete: (id) => api.delete('/favorites/' + id),
};

export const commentAPI = {
  getAll: (params) => api.get('/comments', { params }),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const searchAPI = (query) => api.get('/search', { params: { q: query } });

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),

  getArchives: () => api.get('/admin/archives'),
  getArchiveById: (id) => api.get(`/admin/archives/${id}`),
  createArchive: (data) => api.post('/admin/archives', data),
  updateArchive: (id, data) => api.put(`/admin/archives/${id}`, data),
  deleteArchive: (id) => api.delete(`/admin/archives/${id}`),

  getArchiveChanges: () => api.get('/admin/archive-changes'),
  getArchiveChangeById: (id) => api.get(`/admin/archive-changes/${id}`),
  createArchiveChange: (data) => api.post('/admin/archive-changes', data),
  reviewArchiveChange: (id, data) => api.put(`/admin/archive-changes/${id}/review`, data),
  deleteArchiveChange: (id) => api.delete(`/admin/archive-changes/${id}`),

  getRewardPunishments: (params) => api.get('/admin/rewards-punishments', { params }),
  getRewardPunishmentById: (id) => api.get(`/admin/rewards-punishments/${id}`),
  createRewardPunishment: (data) => api.post('/admin/rewards-punishments', data),
  updateRewardPunishment: (id, data) => api.put(`/admin/rewards-punishments/${id}`, data),
  deleteRewardPunishment: (id) => api.delete(`/admin/rewards-punishments/${id}`),

  getTrainingEnrollments: () => api.get('/admin/training-enrollments'),
  reviewTrainingEnrollment: (id, data) => api.put(`/admin/training-enrollments/${id}/review`, data),

  getCourses: () => api.get('/admin/courses'),
  getCourseById: (id) => api.get(`/admin/courses/${id}`),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
};
