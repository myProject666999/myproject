import request from '../utils/request';

export const authApi = {
  login: (data) => request.post('/login', data),
  register: (data) => request.post('/register', data),
  getCurrentUser: () => request.get('/user'),
  updateProfile: (data) => request.put('/user/profile', data),
  changePassword: (data) => request.put('/user/password', data),
};

export const jobApi = {
  getJobTypes: () => request.get('/job-types'),
  getAllJobTypes: () => request.get('/admin/job-types'),
  createJobType: (data) => request.post('/admin/job-types', data),
  updateJobType: (id, data) => request.put(`/admin/job-types/${id}`, data),
  deleteJobType: (id) => request.delete(`/admin/job-types/${id}`),
  
  getJobs: (params) => request.get('/jobs', { params }),
  getAllJobs: (params) => request.get('/admin/jobs', { params }),
  getJob: (id) => request.get(`/jobs/${id}`),
  createJob: (data) => request.post('/recruiter/jobs', data),
  updateJob: (id, data) => request.put(`/recruiter/jobs/${id}`, data),
  deleteJob: (id) => request.delete(`/jobs/${id}`),
  getRecruiterJobs: (params) => request.get('/recruiter/jobs', { params }),
};

export const userApi = {
  getAdmins: (params) => request.get('/admin/admins', { params }),
  createAdmin: (data) => request.post('/admin/admins', data),
  updateAdmin: (id, data) => request.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => request.delete(`/admin/admins/${id}`),
  
  getRecruiters: (params) => request.get('/admin/recruiters', { params }),
  createRecruiter: (data) => request.post('/admin/recruiters', data),
  updateRecruiter: (id, data) => request.put(`/admin/recruiters/${id}`, data),
  deleteRecruiter: (id) => request.delete(`/admin/recruiters/${id}`),
  
  getUsers: (params) => request.get('/admin/users', { params }),
  deleteUser: (id) => request.delete(`/admin/users/${id}`),
  resetPassword: (id, data) => request.post(`/admin/admins/${id}/reset-password`, data),
};

export const resumeApi = {
  getMyResume: () => request.get('/resume/my'),
  saveResume: (data) => request.post('/resume', data),
  getResume: (id) => request.get(`/recruiter/resumes/${id}`),
  
  applyJob: (data) => request.post('/applications', data),
  getMyApplications: (params) => request.get('/applications/my', { params }),
  getApplications: (params) => request.get('/recruiter/applications', { params }),
  updateApplicationStatus: (id, data) => request.put(`/recruiter/applications/${id}/status`, data),
  
  addFavorite: (data) => request.post('/recruiter/favorites', data),
  getFavorites: (params) => request.get('/recruiter/favorites', { params }),
  removeFavorite: (id) => request.delete(`/recruiter/favorites/${id}`),
};

export const exerciseApi = {
  getExercises: (params) => request.get('/exercises', { params }),
  getAllExercises: (params) => request.get('/admin/exercises', { params }),
  getExercise: (id) => request.get(`/exercises/${id}`),
  createExercise: (data) => request.post('/admin/exercises', data),
  updateExercise: (id, data) => request.put(`/admin/exercises/${id}`, data),
  deleteExercise: (id) => request.delete(`/admin/exercises/${id}`),
  submitExercise: (data) => request.post('/exercises/submit', data),
};

export const newsApi = {
  getNews: (params) => request.get('/news', { params }),
  getAllNews: (params) => request.get('/admin/news', { params }),
  getNewsDetail: (id) => request.get(`/news/${id}`),
  createNews: (data) => request.post('/admin/news', data),
  updateNews: (id, data) => request.put(`/admin/news/${id}`, data),
  deleteNews: (id) => request.delete(`/admin/news/${id}`),
};

export const reviewApi = {
  getReviews: (params) => request.get('/reviews', { params }),
  getMyReviews: () => request.get('/reviews/my'),
  createReview: (data) => request.post('/reviews', data),
  deleteReview: (id) => request.delete(`/admin/reviews/${id}`),
};

export const dashboardApi = {
  getStats: () => request.get('/admin/stats'),
};
